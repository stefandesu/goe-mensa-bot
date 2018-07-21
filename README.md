# Göttingen Mensa Bot

An upcoming Telegram bot for the canteens of the University of Göttingen. A current prototype is available as [@GoeMensaBot](https://t.me/GoeMensaBot), but will be completely rewritten using [goe-mensa-api](https://github.com/stefandesu/goe-mensa-api).

## Planned Features/Commands

- [ ] `/menu` - show a menu with all commands (to minimizing actual typing)
- [ ] `/enable` or `/disable` - enable or disable the daily notification
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
  "subscriptions": [
    "z_menu1",
    "z_menu2",
    "z_vegetarisch",
    "z_vegan"
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
