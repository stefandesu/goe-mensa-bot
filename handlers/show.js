const util = require("../util")
const api = require("../lib/api")

const labels = {
  today: {
    de: "Heute",
    en: "Today"
  },
  chooseDate: {
    de: "Wähle ein Datum:",
    en: "Choose a date:"
  },
  chooseDateMenu: {
    de: "Datum wählen",
    en: "Choose date"
  },
  chooseMensa: {
    de: "Wähle eine Mensa:",
    en: "Choose a mensa:"
  },
  noDishes: {
    de: "Keine Gerichte für",
    en: "No dishes for"
  },
  dishes: {
    de: "Gerichte für",
    en: "Dishes for"
  }
}

function handler(meta, date, mensa) {
  if (!date) {
    return chooseDate(meta, true).then(date => {
      if (date) {
        return chooseMensa(meta, date)
      } else {
        // TODO: Show error
      }
    })
  }
  if (date == "CHOOSE") {
    return chooseDate(meta)
  }
  if (!mensa) {
    return chooseMensa(meta, date)
  }
  return showDishes(meta, date, mensa)
}

function chooseDate({ db, user }, returnNext = false) {
  let currentDate = new Date()
  let today = currentDate.toISOString().substring(0, 10)
  let dates = []
  while (dates.length < 7) {
    currentDate.setDate(currentDate.getDate() + 1)
    dates.push(currentDate.toISOString().substring(0, 10))
  }
  let dateList = []
  for (let date of [today].concat(dates)) {
    dateList.push({
      date
    })
  }
  let query = { $or: dateList }
  // Get available dates from database
  return api.getDishes(db, query).then(results => {
    if (returnNext && results.length) {
      // If it's already after 7 PM, return the next date
      let currentDate = results[0].date
      if ((new Date()).getHours() >= 19) {
        for (let result of results) {
          // FIXME: This might return the wrong date.
          if (result.date > currentDate) {
            return result.date
          }
        }
      }
      return currentDate
    }
    let dateSet = new Set([])
    for (let result of results) {
      dateSet.add(result.date)
    }
    let inline_keyboard = [[]]
    for (let date of dateSet) {
      if (inline_keyboard[inline_keyboard.length - 1].length >= 2) {
        inline_keyboard.push([])
      }
      inline_keyboard[inline_keyboard.length - 1].push({
        text: date == today ? util.getLabel(labels.today, user.language) : `${util.weekdayLabel(date)}`,
        callback_data: "/show" + util.divider + date
      })
    }
    inline_keyboard.push([
      {
        text: util.getLabel(util.backText, user.language),
        callback_data: "/show"
      }
    ])
    return [{
      text: util.getLabel(labels.chooseDate, user.language),
      mode: util.editMode,
      inline_keyboard
    }]
  })
}

function chooseMensa({ user, mensen }, date) {
  // Show list of mensen
  let prefix = "/show" + util.divider + date
  let inline_keyboard = api.mensenToKeyboard(mensen, prefix)
  inline_keyboard.push([{
    text: util.getLabel(labels.chooseDateMenu, user.language),
    callback_data: "/show" + util.divider + "CHOOSE"
  },{
    text: util.getLabel(util.backText, user.language),
    callback_data: "/menu"
  }])
  return Promise.resolve([{
    text: `${util.getLabel(labels.chooseMensa, user.language)}\n(${util.weekdayLabel(date)}, ${date})`,
    mode: util.editMode,
    inline_keyboard
  }])
}

function showDishes({ db, user, categories }, date, mensa) {
  // Show dishes for date and mensa
  let query = { mensa, date }
  return api.getDishes(db, query).then(dishes => {
    let keyboardBack = [
      {
        text: util.getLabel(util.backText, user.language),
        callback_data: "/show" + util.divider + date
      }
    ]
    let inline_keyboard = []
    if (dishes.length == 0) {
      inline_keyboard.push(keyboardBack)
      return [{
        text: `${util.getLabel(labels.noDishes, user.language)} ${mensa} (${date})`,
        mode: util.editMode,
        inline_keyboard
      }]
    } else {
      let text = `*${util.getLabel(labels.dishes, user.language)} ${mensa} (${util.weekdayLabel(date)}, ${date}):*`
      for (let category of categories) {
        let dish = dishes.find(d => d.category == category._id)
        if (!dish) continue
        let categoryTitle = category.labels[0]
        let dishTitle = util.getLabel(dish.title, user.language)
        let price
        try {
          price = dish.prices[user.priceType].toFixed(2)
        } catch(error) {
          price = "?"
        }
        let additives = ""
        if (dish.additives.length > 0 && dish.additives[0] != "") {
          additives = ` (${dish.additives.join(",")})`
        }
        price = price.replace(".", ",")
        text += `\n\n*${categoryTitle}:* ${dishTitle}${additives} (${price} €)`
      }
      inline_keyboard.push(keyboardBack)
      return [{
        text: text,
        mode: util.editMode,
        inline_keyboard
      }]
    }
  })
}

module.exports = {
  handler,
  commands: ["/show"],
  chooseDate,
  labels,
}