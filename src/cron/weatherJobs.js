const cron = require("node-cron");
const {fetchDailyWeather, fetchHourlyWeather} = require("../utils/fetchweather");

function startDailyWeatherJob() {
    cron.schedule('59 10 * * *', async () => {
        console.log('Running daily weather fetch job...');
        try {
            await fetchDailyWeather();
            console.log('Daily weather fetched');
        } catch (err) {
            console.error('❌ Daily fetching job failed:', err.message || err);
        }
    },{ timezone: 'Europe/Kyiv' });
}

function startHourlyWeatherJob() {
    cron.schedule('59 * * * *', async () => {
        console.log('Running hourly weather fetch job...');
        try {
            await fetchHourlyWeather();
            console.log("hourly weather fetched");
        } catch (err) {
            console.error('❌ Hourly job failed:', err.message || err);
        }
    },{ timezone: 'Europe/Kyiv' });
}



module.exports = { startDailyWeatherJob, startHourlyWeatherJob };