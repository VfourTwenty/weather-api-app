API endpoints implemented:
...

Tests cover such cases:
    * Weather API
        -
    * Subscription Management API



subscription logic:

one email cannot subscribe twice for the same city and frequency its already subscribed for. a message is shown accordingly on the subscription page.
to eliminate subscriptions to invalid cities and avoid later errors while emailing users, a test request is sent to weatherapi to check for invalid location. in that case a message is shown as well.



mailing logic:

upon subscription confirmation a WeatherCity (subscription tracking table in the db) gets updated. if a city with previously 0 subscribers is subscribed to, and entry is added, and the relevant counter is incremented based on the subscription type (hourly/daily).
when someone unsubscribes, the relevant counter in the table is decremented and a check is performed to see whether the are other subscribers to the city, and if no (both counters = 0), the entry is removed entirely.
weather is fetched every hour for cities with hourly subscribers count > 0. the data is stored in the weatherData table overwriting the previous entry for a city, so there is only one row per city with the most recent forecast.
after this job is done, cron mailer sends updates for all hourly subscribers using the cashed forecast fom the weatherData

regarding daily subscriptions, its very likely that if someone signed up for daily updates for a city, someone else had already subscribed for hourly updates in the same city, so the cache from hourly updates can be reused in this case.
daily fetcher only queries weatherapi for those cities which have > 0 daily subscribers AND 0 hourly (meaning the data isn't being fetched on hourly basis). Then again, the WeatherData gets filled for missing entries, and the cron mailer uses it to send daily updates.