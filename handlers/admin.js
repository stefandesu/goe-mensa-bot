const util = require("../util")

const labels = {
  noPermissions: {
    de: "Du hast keine Recht für diesen Befehl.",
    en: "You have no permissions for this command."
  },
  success: {
    de: "Befehl vermutlich erfolgreich!",
    en: "Command probably successful!"
  },
  notImplemented: {
    de: "Befehl noch nicht implementiert.",
    en: "Command not yet implemented."
  },
}

function handler({ user, command, bot, adminUser }, ...args) {
  console.log("Admin command by user", user._id, command, args)
  if (user._id != adminUser) {
    console.log("Refused command due to missing rights.")
    return Promise.resolve([{
      text: util.getLabel(labels.noPermissions, user.language)
    }])
  }
  let text = util.getLabel(labels.success, user.language)
  if (command == "/send") {
    send({ bot }, ...args)
  } else {
    text = util.getLabel(labels.notImplemented, user.language)
  }
  return Promise.resolve([{
    text
  }])
}

function send({ bot }, ids_str, text) {
  let ids = ids_str.split(",")
  text = text || ""
  console.log("Sending admin message to", ids)
  console.log(text)
  if (text.length) {
    for (let chat_id of ids) {
      bot.sendMessage(chat_id, text)
    }
  }
}

module.exports = {
  handler,
  commands: ["/send", "/sendall"],
}