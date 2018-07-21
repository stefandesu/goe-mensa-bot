const util = require("../util")
const languages = require("../data/languages")
const users = require("../lib/users")

const labels = {
  text: {
    de: "Einstellungen:",
    en: "Settings:"
  },
  enabledText: {
    de: "Aktiviert: ",
    en: "Enabled: "
  },
  languageText: {
    de: "Sprache: ",
    en: "Language: "
  },
  pricesText: {
    de: "Preise: ",
    en: "Prices: "
  },
}

function handler(meta, command) {
  // Load price types
  return meta.db.collection("price-types").find().toArray().then(priceTypes => {
    meta.priceTypes = priceTypes
    let promise = Promise.resolve(null)
    // Run command
    if (command == "toggleLanguage") {
      promise = toggleLanguage(meta)
    }
    if (command == "toggleEnabled") {
      promise = toggleEnabled(meta)
    }
    if (command == "togglePriceType") {
      promise = togglePriceType(meta)
    }
    return promise.then(() => {
      // Set variables for reply
      let { user } = meta
      let language = languages.find(l => l._id == user.language)
      let lang = language._id
      let enabled = user.enabled ? "✅" : "❌"
      let priceType = priceTypes.find(pt => pt._id == user.priceType)

      // Reply message
      let messages = [{
        text: util.getLabel(labels.text, lang),
        mode: util.editMode,
        inline_keyboard: [
          [
            {
              text: util.getLabel(labels.enabledText, lang) + enabled,
              callback_data: "/settings" + util.divider + "toggleEnabled"
            },
            {
              text: util.getLabel(labels.languageText, lang) + language.flag,
              callback_data: "/settings" + util.divider + "toggleLanguage"
            }
          ],
          [
            {
              text: util.getLabel(labels.pricesText, lang) + priceType.title[language._id],
              callback_data: "/settings" + util.divider + "togglePriceType"
            },
            {
              text: util.backText,
              callback_data: "/menu"
            }
          ]
        ]
      }]
      return messages
    })
  })
}

function toggleLanguage({ db, user }) {
  user.language = languages.find(l => l._id != user.language)._id
  return users.save(db, user)
}

function toggleEnabled({ db, user }) {
  user.enabled = !user.enabled
  return users.save(db, user)
}

function togglePriceType({ db, user, priceTypes }) {
  let length = priceTypes.length, current = length
  // FIXME: Prevent infinite loop
  while (priceTypes[current%length]._id != user.priceType) {
    current += 1
  }
  user.priceType = priceTypes[(current+1)%length]._id
  return users.save(db, user)
}

module.exports = {
  handler,
  commands: ["/settings"]
}