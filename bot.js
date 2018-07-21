const TelegramBot = require("tgfancy")
const mongoClient = require("mongodb").MongoClient
// const schedule = require("node-schedule")
const util = require("./util")
const handlers = require("./handlers")
const users = require("./lib/users")
require("dotenv").config()

const
  mongoUrl = process.env.MONGO_URL || "localhost",
  mongoDb = process.env.MONGO_DB || "goe-mensa-api",
  mongoPort = process.env.MONGO_PORT || 27017,
  mongoUser = process.env.MONGO_USER,
  mongoPass = process.env.MONGO_PASS,
  mongoAuthString = mongoUser ? `${mongoUser}:${mongoPass}@` : "",
  mongoConnectUrl = `mongodb://${mongoAuthString}${mongoUrl}:${mongoPort}`,
  telegramToken = process.env.TELEGRAM_TOKEN,
  bot = new TelegramBot(telegramToken, {polling: true})

let db, commandHandlers = {}
for (let handler of handlers) {
  for (let command of handler.commands) {
    commandHandlers[command] = handler.handler
  }
}

const labels = {
  unknownCommandText: {
    de: "Unbekannter Befehl: ",
    en: "Unknown command: "
  },
}

mongoClient.connect(mongoConnectUrl).then(database => {
  db = database.db(mongoDb)
  bot.onText(/.*/, mainHandler)
  bot.on("callback_query", callbackHandler)
}).catch(error => {
  console.log("Error:", error)
})

function mainHandler(message) {
  let callbackQuery = {
    data: message.text,
    message,
    fromMain: true
  }
  callbackHandler(callbackQuery)
}

function callbackHandler({ data, message, fromMain }) {
  // 1. Get user
  users.get(db, message.chat.id).then(user => {
    // 2. Assemble meta object
    let [command, ...args] = data.split(util.divider)
    let meta = {
      db,
      user,
      message,
      command,
      fromMain: fromMain ? true : false
    }
    // 3. Determine and run handler
    let handler = commandHandlers[command]
    if (!handler) {
      handler = defaultHandler
    }
    handler(meta, ...args).then(messages => {
      messages.forEach( ({ mode = util.sendMode, text, inline_keyboard = [] }) => {
        // 4. Send messages
        let options = {
          reply_markup: {
            inline_keyboard
          },
          parse_mode: "Markdown",
          message_id: message.message_id,
          chat_id: message.chat.id,
          disable_web_page_preview: true,
        }
        // If coming from main, editing is not possible.
        if (mode == util.editMode && fromMain) {
          console.log("Editing message is not possible.")
          mode = util.sendMode
        }
        if (mode == util.sendMode) {
          bot.sendMessage(message.chat.id, text, options)
        } else if (mode == util.editMode) {
          bot.editMessageText(text, options)
        }
      })
    })
  })
}

function defaultHandler({ command, user }) {
  message = {
    text: util.getLabel(labels.unknownCommandText, user.language) + "\"" + command + "\""
  }
  return Promise.resolve([message])
}
