// Make edits here
const express = require('express');
const https = require('https');
const app = express();
const bodyParser = require('body-parser');
const portNumber = process.argv[2];
const readline = require('readline');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })
app.use('/css', express.static(path.join(__dirname, 'css')));

const uri = process.env.MONGO_CONNECTION_STRING;
//const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.t50t9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbAndCollection = {db:process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, 'pages'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("CMSC335-Proj"));

// Start server and CLI interpreter
app.listen(portNumber, () => {
    console.log(`Web server started and running at http://localhost:${portNumber}`);
    rl.prompt();
});

// Setup readline interface for command line interpreter
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Stop to shutdown the server: '
});

// Listen for user input
rl.on('line', (input) => {
    input = input.trim();
    
    if (input === 'stop') {
      console.log("Shutting down the server");
      rl.close();
      process.exit(0);
    } else {
      console.log(`Invalid command: ${input}`);
    }
});

app.get('/', (request, response) => {
    response.render("intro");
});

async function lookUpMany(client, databaseAndCollection) {
  const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find({});
  return await cursor.toArray();
}

async function createTable(client, databaseAndCollection) {
  const result = await lookUpMany(client, databaseAndCollection);

  let table = `<table border=1>
                  <tr>
                      <th>Address</th>
                      <th>Property Type</th>`;

  result.forEach(result => {
      table += `
          <tr>
              <td>${result.address || "N/A"}</td>
              <td>${result.propertyType || "N/A"}</td>
          </tr>
      `;
  });

  table+="</table>"

  return table;
}

app.post("/searchHistory", async (request, response) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
      await client.connect();
      const table = await createTable(client, dbAndCollection);
      response.render("searchHistory", { table: table });
     
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
});

app.post("/clearSearchHistory", async (request, response) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
      await client.connect();
      const result = await client.db(dbAndCollection.db)
          .collection(dbAndCollection.collection)
          .deleteMany({});
      const table = await createTable(client, dbAndCollection);
      response.render("searchHistory", { table: table });
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
});

app.get('/checkValue', (request, response) => {
    response.render("checkValue");
});

// Process form submission and get Zillow API data
app.post('/processValue', async (req, res) => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
    });

    const { address, propertyType, beds, baths, sqftMin, sqftMax } = req.body;

    // Encode the address for the URL
    const encodedAddress = encodeURIComponent(address);

    // Create the Zillow API path
    const path = `/rentEstimate?address=${encodedAddress}&d=0.5&propertyType=${propertyType}`;

    const options = {
        method: 'GET',
        hostname: 'zillow-com1.p.rapidapi.com',
        port: null,
        path: path,
        headers: {
            'x-rapidapi-key': process.env.ZILLOW_API_KEY,
            'x-rapidapi-host': 'zillow-com1.p.rapidapi.com',
        },
    };

    try {
        // Connect to MongoDB
        await client.connect();

        // Make the Zillow API request
        const apiResponse = await new Promise((resolve, reject) => {
            const reqApi = https.request(options, (resApi) => {
                const chunks = [];
                resApi.on('data', (chunk) => chunks.push(chunk));
                resApi.on('end', () => resolve(Buffer.concat(chunks).toString()));
                resApi.on('error', (err) => reject(err));
            });
            reqApi.end();
        });

        // Parse the Zillow API response
        const apiData = JSON.parse(apiResponse);

        // Prepare the data for MongoDB insertion and rendering
        const applicationData = {
            address,
            propertyType,
            beds: beds || 'N/A',
            baths: baths || 'N/A',
            sqftMin: sqftMin || 'N/A',
            sqftMax: sqftMax || 'N/A',
            rentEstimate: apiData.rent || 'No Estimate Available', // Main rent field
            medianRent: apiData.median || 'N/A',                  // Median rent (optional)
            highRent: apiData.highRent || 'N/A',                  // High rent (optional)
            lowRent: apiData.lowRent || 'N/A',                    // Low rent (optional)
        };

        // Insert the data into MongoDB
        await client.db(dbAndCollection.db).collection(dbAndCollection.collection).insertOne(applicationData);

        // Render the results page
        res.render('results', { applicationData });
    } catch (error) {
        console.error('Error Details:', error.message); // Log detailed error
        res.status(500).send(`An error occurred while processing your request: ${error.message}`);
    } finally {
        // Ensure MongoDB connection is closed
        await client.close();
    }
});
