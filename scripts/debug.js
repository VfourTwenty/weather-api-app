const { Subscription, WeatherData, WeatherCity, sequelize } = require('../models');

async function listSubscriptions() {
    const all = await Subscription.findAll();
    console.log('\n📦 All Subscriptions:\n', all.map(s => s.toJSON()));
}

async function findSubscriptionByEmail(email) {
    const match = await Subscription.findAll({ where: { email } });
    console.log(`\n📬 Subscriptions for ${email}:\n`, match.map(s => s.toJSON()));
}

async function listWeather() {
    const all = await WeatherData.findAll({ order: [['datetime', 'DESC']] });
    console.log('\n🌦️ All Weather Data:\n', all.map(w => w.toJSON()));
}

async function findWeatherByCity(city) {
    const match = await WeatherData.findAll({
        where: { city },
        order: [['datetime', 'DESC']],
    });
    console.log(`\n🌆 Weather for ${city}:\n`, match.map(w => w.toJSON()));
}

async function listTrackedCities() {
    const cities = await WeatherCity.findAll({ order: [['city', 'ASC']] });
    console.log('\n📍 Tracked Cities:\n', cities.map(c => c.toJSON()));
}

async function findTrackedCity(city) {
    const entry = await WeatherCity.findOne({ where: { city } });
    if (!entry) {
        console.log(`❌ No tracking info found for ${city}`);
    } else {
        console.log(`\n📊 Tracker for ${city}:\n`, entry.toJSON());
    }
}


// CLI runner
const [,, command, arg] = process.argv; // command will be 'sub:list' or 'weather:find'

(async () => {
    await sequelize.authenticate();

    const [domain, method] = (command || '').split(':');

    switch (`${domain}:${method}`) {
        case 'sub:list':
            await listSubscriptions();
            break;
        case 'sub:find':
            if (!arg) return console.error('❗ Usage: npm run debug sub:find <email>');
            await findSubscriptionByEmail(arg);
            break;
        case 'weather:list':
            await listWeather();
            break;
        case 'weather:find':
            if (!arg) return console.error('❗ Usage: npm run debug weather:find <city>');
            await findWeatherByCity(arg);
            break;
        case 'weather:inspect':
            const [columns] = await sequelize.query(`
              SELECT column_name, data_type
              FROM information_schema.columns
              WHERE table_name = 'WeatherData';
            `);
            console.table(columns);
            break;
        case 'tracker:list':
            await listTrackedCities();
            break;
        case 'tracker:find':
            if (!arg) return console.error('❗ Usage: npm run debug city:find <city>');
            await findTrackedCity(arg);
            break;
        default:
            console.log('🧪 Usage:');
            console.log('  npm run debug sub:list');
            console.log('  npm run debug sub:find email@example.com');
            console.log('  npm run debug weather:list');
            console.log('  npm run debug weather:find \"City Name\"');
            console.log('  npm run debug weather:inspect');
            console.log('  npm run debug tracker:list');
            console.log('  npm run debug tracker:find \"City Name\"');
    }

    await sequelize.close();
})();
