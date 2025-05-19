const { Subscription, sequelize } = require('../models');
const crypto = require('crypto');
const { sendConfirmationEmail } = require('../utils/mailer');

async function seedSubscriptions(count = 100) {
    const cities = ['London', 'New York', 'Austin', 'Zurich'];
    const frequencies = ['hourly', 'daily'];
    const subs = [];

    for (let i = 1; i <= count; i++) {
        const token = crypto.randomBytes(16).toString('hex');
        subs.push({
            email: `user${i}@mailpit.test`,
            city: cities[Math.floor(Math.random() * cities.length)],
            frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
            token,
            confirmed: false,
        });
    }

    await sequelize.sync();
    const inserted = await Subscription.bulkCreate(subs);
    console.log(`✅ Seeded ${count} subscriptions`);

    // Send confirmation emails
    for (const sub of inserted) {
        const confirmUrl = `${req.protocol}://${req.get('host')}/confirm/${token}`;
        await sendConfirmationEmail(sub.email, confirmUrl);
        console.log(`📧 Sent confirmation to ${sub.email}`);
    }

    await sequelize.close();
}
