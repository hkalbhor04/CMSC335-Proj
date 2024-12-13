// Make edits here
const express = require('express');
const readline = require('readline');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.t50t9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbAndCollection = {db:process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, 'pages'));
app.use(bodyParser.urlencoded({ extended: true }));

// Start server and CLI interpreter
const PORT = args[0];
app.listen(PORT, () => {
    console.log(`Web server started and running at http://localhost:${PORT}`);
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