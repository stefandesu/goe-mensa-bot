# Göttingen Mensa Bot

An upcoming Telegram bot for the canteens of the University of Göttingen. A older prototype is available as [@GoeMensaBot](https://t.me/GoeMensaBot), but will be completely rewritten using [goe-mensa-api](https://github.com/stefandesu/goe-mensa-api).

Current tests will be run with [@GoeMensaDevBot](https://t.me/GoeMensaDevBot), but it might not always be available.

## Installation

To install and run the bot on your own device, you'll need a MongoDB server and Node.js. Note that it currently uses [goe-mensa-api](https://github.com/stefandesu/goe-mensa-api)'s database directly, so you'll need to run that as well.

```bash
# Clone repository
git clone https://github.com/stefandesu/goe-mensa-bot.git
cd goe-mensa-bot

# Install dependencies
npm install

# Create .env file
touch .env
# See below for more info on the .env file

# Run the dev server
npm run dev
```

`.env` example file (for defaults see `bot.js`):

```
MONGO_URL=localhost
MONGO_DB=goe-mensa-api
MONGO_PORT=27017
MONGO_USER=mongoadmin
MONGO_PASS=mongopass
TELEGRAM_TOKEN=123456789:abcdefghijkl...xyz
```

Only `TELEGRAM_TOKEN` is required if everything else stays on default.

## Planned Features/Commands

- [x] `/menu` - show a menu with all commands (to minimizing actual typing)
- [x] `/settings` - change the language, price type, or enable/disable the bot
- [ ] `/show` - show dishes for a particular day
- [ ] `/subscribe` - subscribe certain categories of dishes and get them every day
  - [ ] basic subscribing and unsubscribing
  - [ ] list all subscriptions
  - [ ] set time of day to get the message
  - [ ] choose days of the week
- [ ] `/filter` - filters for subscribed dishes
  - [ ] filter out additives
  - [ ] filter out dish types
- [ ] `/notify` - get separate notifications for certain keywords (e.g. your favorites dishes)
- [ ] `/info` or `/help` - show a detailed help screen

## Internal Data Structure
All data will be saved in a MongoDB collection named `users`. A `user` has the following properties:

- `_id` - integer (Telegram user_id)
- `enabled` - bool
- `language` - string (interface and dishes language, default `de`)
- `priceType` - string (which prices to show, default `stu`)
- `subscriptions` - array of strings (category ids)
- `subscriptionTime` - integer? (time to send subscriptions)
- `subscriptionDays` - array of integers (days of the week to send subscriptions, 0 = Sunday)
- `filters` - object with two arrays of strings (filters for additives and dish types)
- `keywords` - array of strings (keywords to notify about)

Example for a user object (maybe someone who is vegetarian and gluten intolerant):

``` json
{
  "_id": 12345,
  "enabled": true,
  "language": "de",
  "priceType": "stu",
  "subscriptions": [
    "z_menu1",
    "z_menu2",
    "z_vegetarisch",
    "z_vegan",
    "t_vegetarisch",
    "t_vegan"
  ],
  "subscriptionTime": 8,
  "subscriptionDays": [1, 2, 3, 4, 5],
  "filters": {
    "additives": ["a"],
    "dish_types": ["meat", "fish"]
  },
  "keywords": [
    "cannelloni"
  ]
}
```

## How To Use
TODO