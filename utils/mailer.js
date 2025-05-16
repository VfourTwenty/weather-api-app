const { Resend } = require('resend');
const {Subscription} = require("../models");
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = process.env.BASE_URL;

async function sendConfirmationEmail(to, confirmUrl) {
    try {
        const result = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to,
            subject: 'Confirm your weather subscription',
            html: `
        <p>Thanks for subscribing! Click below to confirm your subscription:</p>
        <a href="${confirmUrl}">${confirmUrl}</a>
      `
        });

        return result;
    } catch (err) {
        console.error('❌ Failed to send confirmation email:', err);
        return null;
    }
}


async function sendUnsubscribeEmail(to, city) {
    try {
        const result = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to,
            subject: 'You’ve been unsubscribed',
            html: `
        <p>You have been unsubscribed from weather updates for <strong>${city}</strong>.</p>
      `
        });

        return result;
    } catch (err) {
        console.error('❌ Failed to send unsubscribe email:', err);
        return null;
    }
}

async function fetchWeather(city) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text
    };
}

async function sendWeatherUpdate(email, city, weather, token) {
    const subject = `SkyFetch Weather Update for ${city}`;
    const body = `
    <p>Here's your latest weather update for <strong>${city}</strong>:</p>
    <ul>
      <li><strong>Temperature:</strong> ${weather.temperature}°C</li>
      <li><strong>Humidity:</strong> ${weather.humidity}%</li>
      <li><strong>Condition:</strong> ${weather.description}</li>
    </ul>
    <p>To unsubscribe, click <a href="${BASE_URL}/unsubscribe/${token}">here</a>.</p>
    <p style="font-size: 0.8rem; color: gray;">SkyFetch 2025 by VfourTwenty</p>
  `;
    try {
        const response = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: email,
            subject,
            html: body
        });

        console.log(`📧 Email sent to ${email}`, response);
    } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message || err);
    }
}

async function runHourlyJob() {
    const subs = await Subscription.findAll({
        where: { confirmed: true, frequency: 'hourly' }
    });

    for (const sub of subs) {
        try {
            const weather = await fetchWeather(sub.city);
            await sendWeatherUpdate(sub.email, sub.city, weather, sub.token);
            console.log(`✅ Email sent to ${sub.email}`);
        } catch (err) {
            console.error(`❌ Failed for ${sub.email}:`, err.message);
        }
    }
}


async function runDailyJob() {
    const subs = await Subscription.findAll({
        where: { confirmed: true, frequency: 'daily' }
    });

    for (const sub of subs) {
        try {
            const weather = await fetchWeather(sub.city);
            await sendWeatherUpdate(sub.email, sub.city, weather, sub.token);
            console.log(`✅ Daily email sent to ${sub.email}`);
        } catch (err) {
            console.error(`❌ Failed daily for ${sub.email}:`, err.message);
        }
    }
}

module.exports = {
    sendConfirmationEmail,
    sendUnsubscribeEmail,
    runHourlyJob,
    runDailyJob
};
