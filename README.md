# Göttingen Mensa Bot

[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m781866919-2035cabaabfb29a4f73f4896.svg?label=Bot)](https://stats.uptimerobot.com/vZQ21igKB) [![Greenkeeper badge](https://badges.greenkeeper.io/stefandesu/goe-mensa-bot.svg)](https://greenkeeper.io/)

A Telegram bot for the canteens of the University of Göttingen. It is currently running as [@GoeMensaBot](https://t.me/GoeMensaBot), but it is still under development.

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
- [x] `/show` - show dishes for a particular day
- [ ] `/subscribe` - subscribe certain categories of dishes and get them every day
  - [x] basic subscribing and unsubscribing
  - [x] receive daily message with dishes
  - [ ] list all subscriptions
  - [ ] set time of day to get the message
  - [ ] choose days of the week
- [ ] `/filter` - filters for subscribed dishes
  - [ ] filter out additives
  - [ ] filter out dish types
- [ ] `/favorites` - save favorite dishes and get notified if they are available
- [x] `/info` or `/help` - show a help/info screen

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
When you first start the bot, you'll see the main menu. This is the entry point for all features of the bot. The following options are available:

### Mensa Menu
See what's available in a mensa on a given day. By default, the current day (or the next possible day) will be selected, but you can change the date as well. Note that at this point, dishes data is only available two days in advance.

When you choose a mensa, all available dishes will be shown. Note that a mensa may be closed during certain times, e.g. on Saturdays or during the summer holidays.

### Subscribe
You can subscribe to your favorite dish categories. Every day, you'll get a message with all subscribed dishes.

### Favorites
You can also save keywords for your favorite dishes. If one of those is available on a given day, you'll receive a separate message for it!

### Filter
If you are allergic to certain additives or can't or don't want to eat certain types of foods, you can filter them out here. These filters are only applied to your subscriptions, not when going through the Mensa Menu.

### Info
Some infos about the bot and links to GitHub.

### Settings
You can change some settings, like enable or disable the bot, change the language, or change the price type.