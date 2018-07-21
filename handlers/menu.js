const util = require("../util")

const labels = {
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
    de: "Anzeigen",
    en: "Show"
  },
  notifyText: {
    de: "Benachrichtigen",
    en: "Notify"
  },
  settingsText: {
    de: "Einstellungen",
    en: "Settings"
  },
  helpText: {
    de: "Hilfe",
    en: "Help"
  },
}

function handler({ fromMain, user }) {
  let lang = user.language
  let messages = [{
    text: util.getLabel(labels.text, lang),
    mode: fromMain ? util.sendMode : util.editMode,
    inline_keyboard: [
      [
        {
          text: util.getLabel(labels.subscribeText, lang),
          callback_data: "/subscribe"
        },
        {
          text: util.getLabel(labels.filterText, lang),
          callback_data: "/filter"
        }
      ],
      [
        {
          text: util.getLabel(labels.showText, lang),
          callback_data: "/show"
        },
        {
          text: util.getLabel(labels.notifyText, lang),
          callback_data: "/notify"
        }
      ],
      [
        {
          text: util.getLabel(labels.helpText, lang),
          callback_data: "/help"
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