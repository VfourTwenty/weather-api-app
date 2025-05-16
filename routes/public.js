const express = require('express');
const { join } = require('path');
const publicRouter = express.Router();

// for looking up the subscription details since sending in with json is not allowed
const { Subscription } = require('../models');

publicRouter.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/subscribe.html'));
});

publicRouter.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const apiUrl = `${req.protocol}://${req.get('host')}/api/confirm/${token}`;
        const apiRes = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (apiRes.status === 200) {
            const url = new URL('/confirmed.html', `${req.protocol}://${req.get('host')}`);
            const sub = await Subscription.findOne({ where: { token } })

            url.searchParams.set('city', sub.city || '');
            url.searchParams.set('frequency', sub.frequency || '');
            url.searchParams.set('token', token);

            return res.redirect(url.toString());
        } else {
            const errorData = await apiRes.json();
            const errorUrl = new URL('/error.html', `${req.protocol}://${req.get('host')}`);
            errorUrl.searchParams.set('error', errorData.error || 'Unknown error');
            return res.redirect(errorUrl.toString());
        }
    } catch (err) {
        console.error('Confirmation frontend error:', err);
        const errorUrl = new URL('/error.html', `${req.protocol}://${req.get('host')}`);
        errorUrl.searchParams.set('error', 'Internal server error');
        return res.redirect(errorUrl.toString());
    }
});

publicRouter.get('/unsubscribe/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const apiUrl = `${req.protocol}://${req.get('host')}/api/unsubscribe/${token}`;
        const apiRes = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (apiRes.status === 200) {
            const url = new URL('/unsubscribed.html', `${req.protocol}://${req.get('host')}`);

            return res.redirect(url.toString());
        } else {
            const errorData = await apiRes.json();
            const errorUrl = new URL('/error.html', `${req.protocol}://${req.get('host')}`);
            errorUrl.searchParams.set('error', errorData.error || 'Unknown error');
            return res.redirect(errorUrl.toString());
        }
    } catch (err) {
        console.error('Unsubscribe frontend error:', err);
        const errorUrl = new URL('/error.html', `${req.protocol}://${req.get('host')}`);
        errorUrl.searchParams.set('error', 'Internal server error');
        return res.redirect(errorUrl.toString());
    }
});


module.exports = publicRouter;
