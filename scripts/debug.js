const { Subscription, sequelize } = require('../models');

async function listAll() {
    const all = await Subscription.findAll();
    console.log('\n📦 All Subscriptions:\n', all.map(s => s.toJSON()));
}

async function findByEmail(email) {
    const match = await Subscription.findAll({ where: { email } });
    console.log(`\n📬 Subscriptions for ${email}:\n`, match.map(s => s.toJSON()));
}

// CLI runner
const [,, method, arg] = process.argv;

(async () => {
    await sequelize.authenticate();

    switch (method) {
        case 'list':
            await listAll();
            break;
        case 'find':
            if (!arg) return console.error('❗ Usage: node scripts/debug.js find <email>');
            await findByEmail(arg);
            break;
        default:
            console.log('🧪 Usage:');
            console.log('  node scripts/debug.js list');
            console.log('  node scripts/debug.js find email@example.com');
    }

    await sequelize.close();
})();
