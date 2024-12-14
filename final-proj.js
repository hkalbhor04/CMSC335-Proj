// Make edits here
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const portNumber = process.argv[2];
const readline = require('readline');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })
app.use('/css', express.static(path.join(__dirname, 'css')));

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.t50t9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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

app.get('/checkValue', (request, response) => {
    response.render("checkValue");
});

// Handle form submission and query Zillow API
app.post('/checkValue', (req, res) => {
    const { address, propertyType, beds, baths, sqftMin, sqftMax } = req.body;

    if (!address || !propertyType) {
        return res.render('form', { error: "Address and Property Type are mandatory!" });
    }

    // Construct the API endpoint with query parameters
    const queryAddress = encodeURIComponent(address);
    const endpoint = `https://zillow-com1.p.rapidapi.com/rentEstimate?address=${queryAddress}&propertyType=${propertyType}`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'zillow-com1.p.rapidapi.com',
            'x-rapidapi-key': process.env.ZILLOW_API_KEY
        }
    };

    // Make the API call
    https.get(endpoint, options, (apiRes) => {
        let data = '';

        // Accumulate data chunks
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // Process the complete response
        apiRes.on('end', () => {
            try {
                const parsedData = JSON.parse(data);

                if (apiRes.statusCode === 200) {
                    // Render the results page with data
                    res.render('result', { data: parsedData, error: null });
                } else {
                    // Handle API error response
                    res.render('result', { data: null, error: parsedData.message || 'API Error' });
                }
            } catch (error) {
                console.error('Error parsing response:', error.message);
                res.render('result', { data: null, error: 'Invalid response from API' });
            }
        });
    }).on('error', (error) => {
        console.error('Request error:', error.message);
        res.render('result', { data: null, error: 'Unable to connect to API' });
    });
});