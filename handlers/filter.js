const util = require("../util")

const labels = {
  text: {
    de: "Filter noch nicht implementiert.",
    en: "Filter not yet implemented."
  }
}

function handler({ user }) {
  let messages = [{
    text: util.getLabel(labels.text, user.language),
    mode: util.editMode,
    inline_keyboard: [
      [
        {
          text: util.backText,
          callback_data: "/menu"
        }
      ]
    ]
  }]
  return Promise.resolve(messages)
}

module.exports = {
  handler,
  commands: ["/filter"]
}