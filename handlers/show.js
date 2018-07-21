const util = require("../util")

const labels = {
  text: {
    de: "Anzeige noch nicht implementiert.",
    en: "Show not yet implemented."
  }
}

function handler({ user }) {
  let messages = [{
    text: util.getLabel(labels.text, user.language),
    mode: util.editMode,
    inline_keyboard: [
      [
        {
          text: util.getLabel(util.backText, user.language),
          callback_data: "/menu"
        }
      ]
    ]
  }]
  return Promise.resolve(messages)
}

module.exports = {
  handler,
  commands: ["/show"]
}