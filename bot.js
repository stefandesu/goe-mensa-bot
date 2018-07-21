const TelegramBot = require("tgfancy")
const mongoClient = require("mongodb").MongoClient
// const schedule = require("node-schedule")
const util = require("./util")
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
  let [command, ...args] = data.split(util.divider)
  let meta = {
    db,
    message,
    command,
    fromMain: fromMain ? true : false
  }
  let handler = commandHandlers[command]
  if (!handler) {
    handler = defaultHandler
  }
  handler(meta, ...args).then(messages => {
    messages.forEach( ({ mode = util.sendMode, text, inline_keyboard = [] }) => {
      let options = {
        reply_markup: {
          inline_keyboard
        },
        parse_mode: "Markdown",
        message_id: message.message_id,
        chat_id: message.chat.id
      }
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
}

function defaultHandler({ command }, ...args) {
  message = {
    text: "Could not find command \"" + command + "\". (Arguments: " + args + ")"
  }
  return Promise.resolve([message])
}
