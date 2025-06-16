const providerState  = require('../providers/state.js');

async function fetchWeather(city)
{
    return await providerState.activeWeatherProvider.fetchWeather(city);
}

module.exports = { fetchWeather }
