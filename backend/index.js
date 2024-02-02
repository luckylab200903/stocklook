// Import required modules
const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");

// Initialize Express app
const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb://127.0.0.1:27017";
const dbName = "your_database";
const collectionName = "ticker_data";

// Connect to MongoDB
let db;
(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

// Fetch data from WazirX API and store it in MongoDB
// Fetch data from WazirX API and store it in MongoDB
const fetchDataAndStore = async () => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const tickers = response.data;
    const top10Tickers = Object.values(tickers).slice(0, 10); // Get top 10 tickers

    const collection = db.collection(collectionName);
    await collection.deleteMany({}); // Clear existing data

    const tickersToInsert = top10Tickers.map((ticker) => ({
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit,
    }));

    await collection.insertMany(tickersToInsert);
    console.log("Data stored successfully in MongoDB");
  } catch (error) {
    console.error("Error fetching and storing data:", error);
  }
};

// Fetch and store data on server startup
fetchDataAndStore();

// Route to retrieve stored data
app.get("/tickers", async (req, res) => {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
