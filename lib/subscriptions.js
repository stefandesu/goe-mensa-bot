// File that deals with sending subscriptions to users

const api = require("./api")
const util = require("../util")

const labels = {
  hello: {
    de: "Guten Morgen! Hier sind die Gerichte für heute:",
    en: "Good morning! Here are today's dishes:"
  },
  goodbye: {
    de: "Mit /menu kannst du das Menü wieder aufrufen. Ich wünsche dir einen schönen Tag!",
    en: "You can get the menu back with /menu. Have a great day!"
  },
  noDishes: {
    de: "Heute gibt es irgendwie gar keine Gerichte. Vielleicht hat die Mensa geschlossen?",
    en: "Somehow there are no dishes today. Maybe the mensa is closed today?",
  },
}

function prepare(db) {
  let users, mensen, categories, date, dishes
  date = (new Date()).toISOString().substring(0, 10)
  return api.getUsers(db).then(results => {
    users = results
    return api.getMensen(db)
  }).then(results => {
    mensen = results
    return api.getCategories(db)
  }).then(results => {
    categories = results
    return api.getDishes(db, { date })
  }).then(results => {
    dishes = results
    console.log("Sending subscriptions...", date)
    console.log("Total users:", users.length)
    console.log("Total mensen:", mensen.length)
    console.log("Total categories:", categories.length)
    console.log("Total dishes:", dishes.length)
  }).then(() => {
    let messages = []
    let noDishes = dishes.length == 0
    let subbedUsers = users.filter(user => user.subscriptions.length > 0 && user.enabled)
    console.log("Users with subscriptions:", subbedUsers.length)
    for (let user of subbedUsers) {
      let text = ""
      console.log("User", user._id, "...")
      // If there are no dishes at all, send noDishes text.
      if (noDishes) {
        text = util.getLabel(labels.noDishes, user.language) + "\n\n"
      } else {
        for (let mensa of mensen) {
          let dishText = ""
          for (let category of categories.filter(c => c.mensa == mensa._id)) {
            if (user.subscriptions.includes(category._id)) {
              let dish = dishes.find(d => d.category == category._id)
              if (dish) {
                // FIXME: This is duplicate code from show.js!
                let categoryTitle = category.labels[0]
                let dishTitle = util.getLabel(dish.title, user.language)
                let price
                try {
                  price = dish.prices[user.priceType].toFixed(2)
                } catch(error) {
                  price = NaN
                }
                let additives = ""
                if (dish.additives.length > 0 && dish.additives[0] != "") {
                  additives = ` (${dish.additives.join(",")})`
                }
                price = price.replace(".", ",")
                dishText += `*${categoryTitle}:* ${dishTitle}${additives}` + (!isNaN(price) ? ` (${price} €)` : "") + "\n\n"
              }
            }
          }
          if (dishText.length) {
            text += `## *${mensa._id}:* ## \n\n${dishText}`
          }
        }
      }
      if (text.length) {
        text = `# *${date}* #\n${util.getLabel(labels.hello, user.language)} \n\n${text}${util.getLabel(labels.goodbye, user.language)}`
        messages.push({
          chat_id: user._id,
          text
        })
      }
    }
    return messages
  })
}

module.exports = {
  prepare
}
