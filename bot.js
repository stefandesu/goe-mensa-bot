const TelegramBot = require("tgfancy")
const mongoClient = require("mongodb").MongoClient
const schedule = require("node-schedule")
const util = require("./util")
const handlers = require("./handlers")
const users = require("./lib/users")
const api = require("./lib/api")
const subscriptions = require("./lib/subscriptions")
const express = require("express")
const bodyParser = require("body-parser")
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
  expressPort = process.env.EXPRESS_PORT || 8443,
  adminUser = process.env.ADMIN_USER

let telegramWebhookUrl = process.env.TELEGRAM_WEBHOOK_URL
let bot, app

if (process.env.NODE_ENV == "production" && telegramWebhookUrl) {
  console.log("Bot running in production mode")
  // Use a weebhook through an express server
  // Requires a working reverse proxy with a valid SSL certificate!
  bot = new TelegramBot(telegramToken)
  if (!telegramWebhookUrl.startsWith("https://")) {
    telegramWebhookUrl = "https://" + telegramWebhookUrl
  }
  bot.setWebHook(`${telegramWebhookUrl}/bot${telegramToken}`)
  app = express()
  app.use(bodyParser.json())
  app.post(`/bot${telegramToken}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })
  // Start Express Server
  app.listen(expressPort, () => {
    console.log(`Express server is listening on ${expressPort}`)
  })
} else {
  console.log("Bot running in development mode")
  bot = new TelegramBot(telegramToken, {polling: true})
}

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
  // Schedule daily message
  schedule.scheduleJob("0 8 * * 1,2,3,4,5", () => {
    subscriptions.prepare(db).then(messages => {
      console.log("Sending", messages.length, "messages...")
      for (let { chat_id, text } of messages) {
        let options = {
          parse_mode: "Markdown",
        }
        bot.sendMessage(chat_id, text, options)
      }
    })
  })
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
  let mensen, categories, user
  // 1. Get user
  users.get(db, message.chat.id).then(result => {
    user = result
    return api.getMensen(db)
  }).then(results => {
    mensen = results
    return api.getCategories(db)
  }).then(results => {
    categories = results
    // 2. Assemble meta object
    let [command, ...args] = data.split(util.divider)
    let meta = {
      db,
      user,
      message,
      command,
      fromMain: fromMain ? true : false,
      mensen,
      categories,
      bot,
      adminUser,
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
          // editMode deleted previous messages and then sends the message
          bot.deleteMessage(message.chat.id, message.message_id)
          bot.sendMessage(message.chat.id, text, options)
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
