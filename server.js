require("dotenv").config();
const express = require("express");
const axios = require("axios");
const tf = require("@tensorflow/tfjs-node");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(require("cors")());

// Redis Client for Caching
const redisClient = redis.createClient();
redisClient.connect();

// Dummy AI Model (Win Probability Prediction)
const predictWinProbability = async (gameData) => {
    // Example: Simple AI Model using TensorFlow.js
    const model = await tf.loadLayersModel("file://./model.json"); // Replace with trained model
    const inputTensor = tf.tensor2d([gameData.team1_score, gameData.team2_score, gameData.time_remaining], [1, 3]);
    const prediction = model.predict(inputTensor);
    return prediction.dataSync()[0];
};

// API Route: Get Live AI Predictions
app.post("/api/predict", async (req, res) => {
    const { gameId, team1_score, team2_score, time_remaining } = req.body;

    // Check if cached in Redis
    const cacheKey = `winprob:${gameId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return res.json({ win_probability: cachedData });

    try {
        const winProbability = await predictWinProbability({ team1_score, team2_score, time_remaining });

        // Cache the result in Redis for 10 seconds
        await redisClient.set(cacheKey, winProbability, { EX: 10 });

        res.json({ win_probability: winProbability });
    } catch (error) {
        res.status(500).json({ error: "Error generating prediction" });
    }
});

// API Route: Fetch Live Game Stats (Example)
app.get("/api/game/:id", async (req, res) => {
    const gameId = req.params.id;
    
    try {
        const response = await axios.get(`https://api.sportradar.us/nfl/{YOUR_API_KEY}/games/${gameId}/summary.json`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch game data" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`AI Model API running on port ${PORT}`));