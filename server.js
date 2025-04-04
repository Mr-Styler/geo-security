// const express = require('express');
// const axios = require('axios');
// const csv = require('csv-parser');
// const fs = require('fs');
// const tf = require('@tensorflow/tfjs');
// const use = require('@tensorflow-models/universal-sentence-encoder');
// const nlp = require('compromise');
// const Sentiment = require('sentiment');
// const path = require('path');
// const { TwitterApi } = require('twitter-api-v2');
// const morgan = require("morgan");

// const app = express();
// const port = 3050;

// app.use(express.json());
// app.use(express.static('public'));
// app.use(morgan("dev"));

// // Set EJS as the template engine
// app.set('view engine', 'ejs');
// const sentiment = new Sentiment();

// // Create a new Twitter API client
// const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAADYYvwEAAAAA2K6Ia617GhwPq3GAJVFb2j2l5nE%3DWbXSvJeAHxmoIuXfE8D3qALnl1XzoiSUsqBPwYV5A3F6lJ50u0');

// // List of common crime types to search for
// const crimeTypes = [
//   'Robbery',
//   'Assault',
//   'Burglary',
//   'Theft',
//   'Murder',
//   'Vandalism',
//   'Drug offense',
//   'Fraud',
//   'Traffic violation',
//   'Sexual assault'
// ];

// // Load and cache the local dataset (CSV) for crime data
// const loadCrimeData = async (country) => {
//   return new Promise((resolve, reject) => {
//     const crimeData = [];

//     fs.createReadStream(`./public/datasets/${country.toLowerCase()}.csv`)
//       .pipe(csv())
//       .on('data', (row) => {
//         crimeData.push({
//           country: row.Country,
//           city: row.City,
//           street: row.Street,
//           crimeType: row['Crime Type'],
//           date: row.Date,
//           latitude: parseFloat(row.Latitude),
//           longitude: parseFloat(row.Longitude),
//         });
//       })
//       .on('end', () => {
//         resolve(crimeData); // Resolve the promise with the parsed data
//       })
//       .on('error', (error) => {
//         reject(error); // Reject the promise if an error occurs
//       });
//   });
// }

// // Analyze text using sentiment analysis and NER
// async function analyzeCrimeText(record) {
//   const text = `${record.CrimeType} at ${record.Street}, ${record.City}`;

//   // Load the universal sentence encoder model for analysis
//   const model = await use.load();
//   const sentences = [text];
//   const embeddings = await model.embed(sentences);

//   // Named Entity Recognition (NER) using compromise NLP
//   const doc = nlp(text);
//   const people = doc.people().out('array');
//   const places = doc.places().out('array');

//   // Perform sentiment analysis on the text
//   const sentimentResult = sentiment.analyze(text);

//   // Dynamically classify the crime based on the list of crime types
//   const classification = crimeTypes.find(crime => text.includes(crime)) || 'Unknown';

//   return {
//     classification,         // Classification based on the Crime Type
//     people,                 // Detected people in the text (NER)
//     places,                 // Detected places in the text (NER)
//     sentimentScore: sentimentResult.score,  // Sentiment analysis score
//   };
// }

// // Analyze crime data, weather, and social media
// const analyzeCrimeData = async (crimeData, weatherData, socialMediaData) => {
//   let totalSentiment = 0;
//   const analysisResults = [];

//   for (const record of crimeData) {
//     const analysisResult = await analyzeCrimeText(record);  // Pass the entire record
//     analysisResults.push(analysisResult);
//     totalSentiment += analysisResult.sentimentScore;
//     console.log(analysisResult);
//   }

//   // Calculate average sentiment and hostility level
//   const avgSentiment = totalSentiment / crimeData.length;
//   const hostilityLevel = avgSentiment > 0 ? 'low' : avgSentiment < -5 ? 'high' : 'medium';

//   return {
//     analysisResults,
//     weather: weatherData,
//     socialMediaSentiment: socialMediaData,
//     hostilityLevel,
//   };
// };

// // Fetch weather data using Axios with timeout
// const getWeatherData = async (place) => {
//   const apiKey = '141710af2113bab9f55ef73e1bcd33d5';
  
//   const url = `http://api.openweathermap.org/data/2.5/forecast?q=${place.toLowerCase().split(' ').join('-')}&appid=${apiKey}`;
//   console.log(url)

//   try {
//     const response = await axios.get(url, { timeout: 20000 });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to fetch weather data:', error.message);
//     throw new Error('Error fetching weather data');
//   }
// };

// // Fetch city details from OpenStreetMap using Axios with timeout
// const getCityFromCoordinates = async (lat, lon) => {
//   const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

//   try {
//     const response = await axios.get(url, { timeout: 5000 });
//     console.log(response.data.address);
//     return response.data.address;
//   } catch (error) {
//     console.error('Failed to fetch city data:', error.message);
//     throw new Error('Error fetching city from coordinates');
//   }
// };

// // Function to fetch social media sentiment using Twitter API v2
// const getSocialMediaSentiment = async (city) => {
//   try {
//     // Create a search query with all crime types
//     const query = crimeTypes.map(crime => `${city} ${crime}`).join(' OR ');
//     const tweets = await twitterClient.v2.search(query, { 'tweet.fields': 'text', max_results: 10 });

//     let totalSentiment = 0;
//     const sentimentResults = [];

//     for (const tweet of tweets.data) {
//       const sentimentResult = sentiment.analyze(tweet.text);
//       sentimentResults.push(sentimentResult);
//       totalSentiment += sentimentResult.score;
//     }

//     // Calculate the average sentiment score for the tweets
//     const avgSentiment = totalSentiment / sentimentResults.length;

//     return avgSentiment; // Return the average sentiment score
//   } catch (error) {
//     console.error('Error fetching tweets:', error);
//     return 0; // In case of error, return a neutral sentiment score
//   }
// };

// // Main API endpoint
// app.get('/analyze-location', async (req, res) => {
//   const { lat, lon } = req.query;

//   try {
//     const city = await getCityFromCoordinates(lat, lon);
//     const crimeData = await loadCrimeData(city.country.split('-').join('_'));
//     const weatherData = await getWeatherData(city.state);
//     // const socialMediaData = await getSocialMediaSentiment(city.city);

//     // const analysis = await analyzeCrimeData(crimeData, weatherData, socialMediaData);
//     const analysis = await analyzeCrimeData(crimeData, weatherData, 0);

//     res.json({
//       city,
//       analysis,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error analyzing the data' });
//   }
// });

// // Serve the frontend
// app.get('/', (req, res) => {
//   // res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   res.render('index');
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const morgan = require('morgan');
const geolib = require('geolib');
const { TwitterApi } = require('twitter-api-v2'); // Import Twitter API library
require('dotenv').config({path: "./config.env"});

const app = express();
const port = 3050;

app.set('view engine', 'ejs'); // Serve static files from the public directory
// To parse JSON data
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

// OpenWeather API function
async function getWeather(lat, lon) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

// Google Maps Traffic API function
async function getTrafficData(lat, lon) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lon}&destination=${lat},${lon}&key=${apiKey}`;
    
    try {
        // const response = await axios.get(url);
        // const trafficInfo = response.data.routes[0].legs[0]; // Assuming there is at least one route
        // return {
        //     durationInTraffic: trafficInfo.duration_in_traffic.text,
        //     distance: trafficInfo.distance.text,
        //     trafficStatus: trafficInfo.traffic_speed_entry ? 'Heavy Traffic' : 'Normal Traffic'
        // };
        const dummyTrafficData = {
          durationInTraffic: "20 mins", // Simulated duration in traffic
          distance: "5 miles", // Simulated distance
          trafficStatus: "Heavy Traffic" // Simulated traffic status
      };
  
      // Simulate some randomness for demonstration purposes
      const randomTrafficStatus = Math.random() > 0.5 ? "Normal Traffic" : "Heavy Traffic";
      const randomDuration = randomTrafficStatus === "Normal Traffic" ? "10 mins" : "25 mins";
  
      return {
          durationInTraffic: randomDuration,
          distance: dummyTrafficData.distance,
          trafficStatus: randomTrafficStatus
      };
    } catch (error) {
        console.error('Error fetching traffic data:', error);
    }
}

// Twitter API function
async function getSocialMediaData(query, lat, lon) {
    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    try {
        const geoQuery = `${lat},${lon},10km`; // Adjust the radius as needed
        // const { data: tweets } = await twitterClient.v2.search(query, {
        //     max_results: 20, // Limit results to 5 tweets
        //     tweet: {
        //         fields: ['created_at', 'text']
        //     },
        //     place: {
        //         geoQuery
        //     }
        // });

        const tweets = [
          {
              created_at: "2024-10-10T12:00:00Z",
              text: "Just witnessed a robbery at the local store! Stay safe, everyone!",
              user: {
                  username: "localnews",
                  id: "12345"
              },
              place: {
                  name: "Downtown",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7128,
                      longitude: -74.0060
                  }
              }
          },
          {
              created_at: "2024-10-10T13:00:00Z",
              text: "Heard some gunshots near the park. Calling the police!",
              user: {
                  username: "concernedcitizen",
                  id: "67890"
              },
              place: {
                  name: "City Park",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7129,
                      longitude: -74.0059
                  }
              }
          },
          {
              created_at: "2024-10-10T14:00:00Z",
              text: "The area feels unsafe lately. Watch your backs, everyone!",
              user: {
                  username: "safetyfirst",
                  id: "11121"
              },
              place: {
                  name: "North Side",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7130,
                      longitude: -74.0070
                  }
              }
          },
          {
              created_at: "2024-10-10T15:00:00Z",
              text: "Traffic is heavy, and there have been reports of suspicious activity around 5th and Main.",
              user: {
                  username: "trafficwatcher",
                  id: "22232"
              },
              place: {
                  name: "5th and Main",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7131,
                      longitude: -74.0071
                  }
              }
          },
          {
              created_at: "2024-10-10T16:00:00Z",
              text: "Stay alert! There's been an uptick in crime in our neighborhood.",
              user: {
                  username: "neighborhoodwatch",
                  id: "33343"
              },
              place: {
                  name: "West End",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7132,
                      longitude: -74.0072
                  }
              }
          },
          {
              created_at: "2024-10-10T17:00:00Z",
              text: "Just saw the police patrolling more frequently. Hopefully, they're on top of things!",
              user: {
                  username: "optimisticcitizen",
                  id: "44454"
              },
              place: {
                  name: "East Side",
                  country: "USA",
                  coordinates: {
                      latitude: 40.7133,
                      longitude: -74.0073
                  }
              }
          }
        ]


        return tweets;
    } catch (error) {
        console.error('Error fetching tweets:', error);
    }
}

// Crime check function using CSV and geolib for 100m distance
async function checkCrime(lat, lon) {
    return new Promise((resolve, reject) => {
        const nearbyCrimes = [];
        fs.createReadStream('crimes.csv')
            .pipe(csv())
            .on('data', (data) => {
                const crimeLat = parseFloat(data.Latitude);
                const crimeLon = parseFloat(data.Longitude);

                // Calculate distance
                const distance = geolib.getDistance(
                    { latitude: lat, longitude: lon },
                    { latitude: crimeLat, longitude: crimeLon }
                );

                if (distance <= 100) {
                    nearbyCrimes.push(data);
                }
            })
            .on('end', () => {
                resolve(nearbyCrimes);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function geocodeLocation(locationName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
  
  console.log(url)

  try {
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      }
      throw new Error('Location not found');
  } catch (error) {
      console.error('Error geocoding location:', error);
      throw new Error('Geocoding failed');
  }
}

app.get('/map', (req, res) => {
  res.render('map')
})

app.get('/test', (req, res) => {
  res.render('test')
})

app.get('/', (req, res) => {
  console.log('route hit');
  res.render('landing');
});

// Main safety assessment endpoint
app.post('/assess', async (req, res) => {
  let { lat, lon, locationName } = req.body;

  try {
      // Check if locationName is provided and get coordinates
      if (locationName) {
          const coords = await geocodeLocation(locationName);
          lat = coords.latitude;
          lon = coords.longitude;
      }

      console.log(locationName)
      console.log(lat, lon)

      const weather = await getWeather(lat, lon);
      const socialMedia = await getSocialMediaData('crime OR danger OR safety', lat, lon);
      const crimeData = await checkCrime(lat, lon);
      const trafficData = await getTrafficData(lat, lon);

      let safetyScore = 100;

      // Reduce score based on weather
      if (weather.weather[0].main !== 'Clear') {
          safetyScore -= 10;
      }

      // Reduce score based on crime proximity
      const crimeDeduction = crimeData.length * 5;
      safetyScore -= crimeDeduction;

      // Reduce score based on traffic
      if (trafficData.trafficStatus === 'Heavy Traffic') {
          safetyScore -= 15; // Adjust as needed
      }

      // Ensure score doesn't go negative
      safetyScore = Math.max(safetyScore, 0);

      res.json({
          safetyScore,
          weather: weather.weather,
          socialMedia,
          crimeData,
          trafficData
      });
  } catch (error) {
      res.status(500).send('Error assessing safety');
  }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
