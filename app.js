const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');

const weatherRouter = require('./routes/weather');
const subscriptionRouter = require('./routes/subscription');
const publicRouter = require('./routes/public')

const app = express();
const cron = require('node-cron');
const {runHourlyJob, runDailyJob} = require('./utils/mailer');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api', weatherRouter);
app.use('/api', subscriptionRouter);

// public route
app.use('/', publicRouter);

// 404 handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message
  });
});

cron.schedule('0 * * * *', () => {
  console.log('Running hourly weather job...');
  runHourlyJob();
});

cron.schedule('* 11 * * *', () => {
  console.log('Running daily weather job...');
  runDailyJob();
});

module.exports = app;
