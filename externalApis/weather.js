const axios = require('axios');
require('dotenv').config();

const fetchWeatherData = async (city = 'New York') => {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching weather data: ' + error.message);
    }
};

module.exports = { fetchWeatherData };
