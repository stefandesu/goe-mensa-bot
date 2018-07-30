const util = require("../util")
const api = require("../lib/api")
const users = require("../lib/users")

const labels = {
  text: {
    de: "Durch Abos bekommst du jeden Tag automatisch die Gerichte, die dich interessieren, zugeschickt!\n\nWähle zunächst eine Mensa:",
    en: "With abos, you'll automatically get sent all dishes of interest every day!\n\nFirst, choose a mensa:"
  },
  chooseCategory: {
    de: "Wähle nun Kategorien aus:\n✅ = abonniert\n❌ = nicht abonniert",
    en: "Now, choose categories:\n✅ = subscribed\n❌ = not subscribed"
  }
}

function handler(meta, mensa, category) {
  if (!mensa) {
    return chooseMensa(meta)
  }
  let promise = Promise.resolve()
  if (category) {
    promise = saveSubscription(meta, mensa, category)
  }
  return promise.then(() => chooseCategory(meta, mensa))
}

function chooseMensa({ mensen, user }) {
  let inline_keyboard = api.mensenToKeyboard(mensen, "/subscribe")
  inline_keyboard.push([
    {
      text: util.getLabel(util.backText, user.language),
      callback_data: "/menu"
    }
  ])
  let messages = [{
    text: util.getLabel(labels.text, user.language),
    mode: util.editMode,
    inline_keyboard
  }]
  return Promise.resolve(messages)
}

function chooseCategory({ categories, user }, mensa) {
  let relevantCategories = categories.filter(c => c.mensa == mensa)
  let inline_keyboard = api.categoriesToKeyboard(relevantCategories, "/subscribe" + util.divider + mensa, user, true)
  inline_keyboard.push([
    {
      text: util.getLabel(util.backText, user.language),
      callback_data: "/subscribe"
    }
  ])
  let messages = [{
    text: util.getLabel(labels.chooseCategory, user.language),
    mode: util.editMode,
    inline_keyboard
  }]
  return Promise.resolve(messages)
}

function saveSubscription({ db, user }, mensa, category) {
  // TODO: Check if category exists
  if (!user.subscriptions.includes(category)) {
    user.subscriptions.push(category)
  } else {
    user.subscriptions = user.subscriptions.filter(s => s != category)
  }
  return users.save(db, user)
}

module.exports = {
  handler,
  commands: ["/subscribe"]
}