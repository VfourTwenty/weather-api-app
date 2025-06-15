const { Subscription } = require('../db/models');
const crypto = require('crypto');
const { incrementCityCounter, decrementCityCounter } = require('../utils/subtracker');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genToken() {
    return crypto.randomBytes(20).toString('hex');
}

async function doesSubExist({ email, city, frequency} )
{
    const result =  await Subscription.findOne({ where: { email, city, frequency } });
    console.log("does sub exist", result);
    return result;
}

async function createSub(email, city, frequency) {
    if (!email || !city || !frequency) {
        throw new Error('MISSING REQUIRED FIELDS');
    }

    if (!emailRegex.test(email)) {
        throw new Error('INVALID EMAIL FORMAT');
    }

    if (!['hourly', 'daily'].includes(frequency)) {
        throw new Error('INVALID FREQUENCY');
    }

    const exists = await doesSubExist({ email, city, frequency} );

    if (exists)
    {
        throw new Error('DUPLICATE');
    }
    const token = genToken();

    await Subscription.create({ email, city, frequency, confirmed: false, token });
    return token;
}

async function confirmSub(token) {
    const sub = await Subscription.findOne({ where: { token } });
    if (!sub)  throw new Error('NOT_FOUND');
    if (sub.confirmed) throw new Error('ALREADY_CONFIRMED');

    sub.confirmed = true;
    await sub.save();
    await incrementCityCounter(sub.city, sub.frequency);
    return sub;
}

async function deleteSub(token) {
    const sub = await Subscription.findOne({ where: { token } });
    if (!sub) throw new Error('NOT_FOUND');

    await decrementCityCounter(sub.city, sub.frequency);
    await sub.destroy();
    return sub;
}


module.exports = { createSub, confirmSub, deleteSub, findByToken: (t) => Subscription.findOne({ where:{token:t} }) };
