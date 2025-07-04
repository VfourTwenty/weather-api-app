console.log('weather mock called');

async function fetchWeather(city)
{
    if (city === 'Kyiv') {
        return {
            temperature: 22,
            humidity: 60,
            description: 'Clear sky',
        };
    } else {
        const error = new Error('No matching location found.');
        error.response = { status: 404 };
        throw error;
    }
}

module.exports = { fetchWeather };
