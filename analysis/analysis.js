const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');
const nlp = require('compromise');
const axios = require('axios'); // For pre-trained sentiment model download

let sentimentModelInstance;

// Load pre-trained sentiment analysis model
async function loadSentimentModel() {
    if (!sentimentModelInstance) {
        sentimentModelInstance = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
    }
}

// Analyze sentiment using the TensorFlow model
async function analyzeSentimentWithML(text) {
    if (!sentimentModelInstance) await loadSentimentModel();

    // Preprocess text (convert to token ids)
    const inputText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ');
    const inputTensor = tf.tensor([inputText]);

    // Make sentiment prediction
    const prediction = sentimentModelInstance.predict(inputTensor);
    const sentimentScore = prediction.dataSync()[0];  // Output sentiment score

    return sentimentScore;
}

// Function to analyze the text for classification, NER, and sentiment
async function analyzeCrimeText(text) {
    // 1. Classify text using embeddings (text classification)
    const model = await use.load();
    const sentences = [text];
    const embeddings = await model.embed(sentences);
    
    // Placeholder text classification result
    const classification = 'Robbery'; // Simulated classification result

    // 2. Perform Named Entity Recognition (NER) using compromise
    const doc = nlp(text);
    const people = doc.people().out('array');
    const places = doc.places().out('array');

    // 3. Perform advanced sentiment analysis using TensorFlow model
    const sentimentScore = await analyzeSentimentWithML(text);

    // Combine and return analysis results
    return {
        classification,
        people,
        places,
        sentimentScore
    };
}

// Main function that integrates crime data with other data sources
const analyzeCrimeData = async (crimeData, weatherData, socialMediaData) => {
    const hostilityLevels = {};

    for (const record of crimeData) {
        const city = record.city;

        if (!hostilityLevels[city]) {
            hostilityLevels[city] = {
                totalCrimes: 0,
                crimeCounts: {},
                weather: {},
                socialMediaSentiment: 0,
                analysisResults: []
            };
        }

        // Analyzing crime data
        hostilityLevels[city].totalCrimes += 1;

        // Analyze the crime text with the new ML model for sentiment analysis
        const analysisResult = await analyzeCrimeText(record.description);
        hostilityLevels[city].analysisResults.push(analysisResult);

        // Additional data processing (weather, social media, etc.)
        if (weatherData && weatherData.name === city) {
            hostilityLevels[city].weather.temperature = weatherData.main.temp;
            hostilityLevels[city].weather.condition = weatherData.weather[0].description;
        }

        if (socialMediaData) {
            hostilityLevels[city].socialMediaSentiment += socialMediaData.sentimentScore || 0;
        }
    }

    // Set hostility levels based on total crimes and analysis
    for (const city in hostilityLevels) {
        const total = hostilityLevels[city].totalCrimes;
        hostilityLevels[city].hostilityLevel = total > 50 ? 'high' : total > 20 ? 'medium' : 'low';
    }

    return hostilityLevels;
};

module.exports = { analyzeCrimeData };
