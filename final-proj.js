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

app.get('/', (request, response) => {
    response.render("intro", { title: "Baby Zillow" });
});

app.get('/checkValue', (request, response) => {
    response.render("checkValue", { portNumber: portNumber });
});