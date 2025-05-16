const express = require('express');
const router = express.Router();
const { Subscription } = require('../models');
const crypto = require('crypto');

const { sendConfirmationEmail, sendUnsubscribeEmail } = require('../utils/mailer');
const { isBrowser, respondOrRedirect } = require('../utils/respond');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// subscription
router.post('/subscribe', async (req, res) => {
    const { email, city, frequency } = req.body;

    // required fields
    if (!email || !city || !frequency) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // validate frequency
    if (!['hourly', 'daily'].includes(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency' });
    }

    // validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    // check is same subscription already exists
    try {
        const exists = await Subscription.findOne({ where: { email, city, frequency } });

        if (exists) {
            // respondOrRedirect(req, res, 409, 'Email already subscribed for this city and frequency')
            return res.status(409).json({ error: 'Email already subscribed for this city and frequency' });
        }

        // generate a token
        const token = crypto.randomBytes(20).toString('hex');

        // create entry
        await Subscription.create({
            email,
            city,
            frequency,
            confirmed: false,
            token
        });

        // Send confirmation email
        // change this to public route instead of api/
        const confirmUrl = `${req.protocol}://${req.get('host')}/confirm/${token}`;
        const emailResult = await sendConfirmationEmail(email, confirmUrl);

        if (!emailResult || emailResult.error) {
            //respondOrRedirect(req, res, 500, 'Subscription saved but failed to send confirmation email.')
            return res.status(500).json({ error: 'Subscription saved but failed to send confirmation email.' });
        }

        res.status(200).json({ message: 'Subscription successful. Confirmation email sent.' });

    } catch (err) {
        console.error(err);
       // respondOrRedirect(req, res, 500, 'Failed to subscribe');
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// confirmation
router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    // basic token format check (optional)
    if (!token || token.length < 10) {
        //respondOrRedirect(req, res, 400, 'Invalid token');
        return res.status(400).json({ error: 'Invalid token' });
    }

    try {
        const sub = await Subscription.findOne({ where: { token } });

        if (!sub) {
           // respondOrRedirect(req, res, 404, 'Token not found');
            return res.status(404).json({ error: 'Token not found' });
        }

        if (sub.confirmed) {
          //  respondOrRedirect(req, res, 400, 'Subscription already confirmed');
            return res.status(400).json({ error: 'Subscription already confirmed' });
        }

        sub.confirmed = true;
        await sub.save();

        // additional fields for confirmation page
        res.status(200).json({ message: 'Subscription confirmed successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to confirm subscription' });
    }
});

// cancel subscription
router.get('/unsubscribe/:token', async (req, res) => {
    const { token } = req.params;

    // optional: basic format check
    if (!token || token.length < 10) {
        return res.status(400).json({ error: 'Invalid token' });
    }

    try {
        const sub = await Subscription.findOne({ where: { token } });

        if (!sub) {
            return res.status(404).json({ error: 'Token not found' });
        }

        const emailResult = await sendUnsubscribeEmail(sub.email, sub.city);

        if (!emailResult || emailResult.error) {
            console.log(`error: ${emailResult.error.message}`);
            return res.status(500).json({ error: 'Unsubscribed, but failed to send confirmation email.' });
        }

        res.status(200).json({ message: 'Unsubscribed successfully'});

        await sub.destroy(); // delete from DB only after email succeeds

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

module.exports = router;
