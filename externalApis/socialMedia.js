const axios = require('axios');
require('dotenv').config();

const fetchSocialMediaData = async () => {
    try {
        const response = await axios.get(`https://api.socialmedia.com/data?apikey=${process.env.SOCIAL_MEDIA_API_KEY}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching social media data: ' + error.message);
    }
};

module.exports = { fetchSocialMediaData };
