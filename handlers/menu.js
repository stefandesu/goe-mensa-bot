const util = require("../util")

const labels = {
  startText: {
    de: "Willkommen beim Göttingen Mensa Bot von @stefandesu!\n\n",
    en: "Welcome to the Göttingen Mensa Bot by @stefandesu!\n\n"
  },
  text: {
    de: "Wähle eine Option:",
    en: "Choose an option:"
  },
  subscribeText: {
    de: "Abonnieren",
    en: "Subscribe"
  },
  filterText: {
    de: "Filtern",
    en: "Filter"
  },
  showText: {
    de: "Mensa-Menü",
    en: "Mensa Menu"
  },
  favoritesText: {
    de: "Favoriten",
    en: "Favorites"
  },
  settingsText: {
    de: "Einstellungen",
    en: "Settings"
  },
  helpText: {
    de: "Info",
    en: "Info"
  },
}

function handler({ fromMain, user, command }) {
  let lang = user.language
  let messages = [{
    text: `${command == "/start" ? util.getLabel(labels.startText, lang) : ""}${util.getLabel(labels.text, lang)}`,
    mode: fromMain ? util.sendMode : util.editMode,
    inline_keyboard: [
      [
        {
          text: util.getLabel(labels.showText, lang),
          callback_data: "/show"
        },
        {
          text: util.getLabel(labels.subscribeText, lang),
          callback_data: "/subscribe"
        }
      ],
      [
        {
          text: util.getLabel(labels.favoritesText, lang),
          callback_data: "/favorites"
        },
        {
          text: util.getLabel(labels.filterText, lang),
          callback_data: "/filter"
        }
      ],
      [
        {
          text: util.getLabel(labels.helpText, lang),
          callback_data: "/info"
        },
        {
          text: util.getLabel(labels.settingsText, lang),
          callback_data: "/settings"
        }
      ]
    ]
  }]
  return Promise.resolve(messages)
}

module.exports = {
  handler,
  commands: ["/menu", "/start"]
}