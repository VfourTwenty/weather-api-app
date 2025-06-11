require('dotenv').config();

const env = process.env.NODE_ENV || 'docker';
const config = require('../config/config.js')[env];

const { state} = require('../providers/weather-providers/weatherProvidersAll');


function fetchWeather(city)
{
    return state.activeWeatherProvider.fetchWeather(city);
}

module.exports = { fetchWeather }