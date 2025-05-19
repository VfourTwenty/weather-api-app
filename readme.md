# SkyFetch – Weather API Subscription Service

A weather forecast subscription API with email notifications, built using Node.js, PostgreSQL, and Resend.

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Subscription Logic](#subscription-logic)
- [Mailing Logic](#mailing-logic)
- [Database Usage](#database-usage)
- [Testing](#testing)
- [Docker Support](#docker-support)
- [Hosting](#hosting)
- [Scripts](#scripts)

---

## API Endpoints

The following API endpoints are implemented:

### Weather API

- `GET /weather`  
  Get current weather for a city  
  [Jump to definition](#weather-api)

### Subscription Management API

- `POST /subscribe`  
  Subscribe to weather updates  
  [Jump to definition](#subscription-management-api)

- `GET /confirm/:token`  
  Confirm email subscription

- `GET /unsubscribe/:token`  
  Unsubscribe from weather updates

There are also public routes (homepage, `/confirm/:token`, `/unsubscribe/:token`) that render the corresponding HTML pages.

---

## Subscription Logic

- One email cannot subscribe twice for the same city and frequency. A message is shown accordingly on the subscription page.
- To eliminate invalid subscriptions, a test request is sent to WeatherAPI. If the location is invalid, an error message is shown and the subscription is rejected.

---

## Mailing Logic

- Upon subscription confirmation, a `WeatherCity` entry in the database is updated. If it's a new city (with 0 previous subscribers), a new entry is added, and the appropriate counter (hourly/daily) is incremented.
- On unsubscription, the counter is decremented. If both counters reach 0, the entry is removed entirely.
- Weather is fetched hourly for cities with `hourlySubscribers > 0`. Forecast is cached in the `WeatherData` table, overwriting previous entries (only 1 row per city).
- After caching, hourly updates are sent using the stored forecast via cron.
- For daily updates, the hourly cache is reused when possible. Otherwise, daily fetcher pulls missing data for cities with `dailySubscribers > 0` and `hourlySubscribers = 0`.

> ⏱️ A timeout is used in the mailing process to work around request limits.

---

## Database Usage

- PostgreSQL is used with Sequelize ORM.
- The `WeatherCity` table tracks subscriptions by city and type.
- The `WeatherData` table holds the most recent forecast per city.

---

## Testing

Tests cover:

- **Weather API**
    - City validation
    - Forecast retrieval
- **Subscription Management API**
    - New subscriptions
    - Token-based confirmation/unsubscription
    - Duplicate prevention

Tests run in a separate environment and database using:

```bash```
npm test

## Docker Support

✅ Fully tested with:

- Docker Engine (Linux)
- Docker Desktop (Windows)

To run:

```bash```
docker-compose up --build

## Hosting

🌐 The app is also hosted on [Resend](https://resend.com) for mailing services and demo purposes.

---

## Scripts

- Debug scripts are available in `scripts/debug` to view:
    - Whole tables
    - Individual entries
- A seeder script is available at `scripts/seeder` to populate test data.

