const util = require("../util")

const labels = {
  text: {
    de: "Dieser Bot ist ein Open-Source-Projekt von Stefan Peters (@stefandesu). Falls du an der Entwicklung interessiert ist, schau doch mal auf der [GitHub-Seite](https://github.com/stefandesu/goe-mensa-bot) vorbei.\n\nDer Bot wird durch Menüs gesteuert. Das Menü sollte sich beim Start des Bots schon geöffnet haben, aber es kann jederzeit wieder durch /menu geöffnet werden. For ein detailliertes How-To, besuche [diese Seite](https://github.com/stefandesu/goe-mensa-bot#how-to-use) (nur Englisch).\n\nManchmal gibt es kurze Verzögerungen nach der Auswahl eines Menüpunkts, bitte nicht wundern. 😉",
    en: "This bot is an open source project by Stefan Peters (@stefandesu). If you're interested in the development, please take a look at the [GitHub page](https://github.com/stefandesu/goe-mensa-bot).\n\nThe bot is supposed to be used through menus. They can be opened with /menu, but they should already have opened when you started the bot. For a detailed how-to, please visit [this page](https://github.com/stefandesu/goe-mensa-bot#how-to-use) (English only).\n\nSometimes, there are delays when choosing a menu option, please be patient. 😉"
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
  commands: ["/help", "/info"]
}