// Make edits here
const express = require('express');
const readline = require('readline');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.t50t9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbAndCollection = {db:process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');
