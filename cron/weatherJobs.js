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
    });
}

function startHourlyWeatherJob() {
    cron.schedule('05 * * * *', async () => {
        console.log('Running hourly weather fetch job...');
        try {
            await fetchHourlyWeather();
            console.log("hourly weather fetched");
        } catch (err) {
            console.error('❌ Hourly job failed:', err.message || err);
        }
    });
}



module.exports = { startDailyWeatherJob, startHourlyWeatherJob };