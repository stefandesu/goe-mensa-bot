const util = require("../util")

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
  return db.collection("dishes").find(query).sort({ date: 1 }).toArray().then(results => {
    if (returnNext && results.length) {
      return results[0].date
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
        text: date == today ? util.getLabel(labels.today, user.language) : date,
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

function chooseMensa({ db, user }, date) {
  // Show list of mensen
  return db.collection("mensen").find().sort({ order: 1 }).toArray().then(mensen => {
    let inline_keyboard = [[]]
    for (let mensa of mensen) {
      if (inline_keyboard[inline_keyboard.length - 1].length >= 2) {
        inline_keyboard.push([])
      }
      inline_keyboard[inline_keyboard.length - 1].push({
        text: mensa._id,
        callback_data: "/show" + util.divider + date + util.divider + mensa._id
      })
    }
    inline_keyboard.push([{
      text: util.getLabel(labels.chooseDateMenu, user.language),
      callback_data: "/show" + util.divider + "CHOOSE"
    },{
      text: util.getLabel(util.backText, user.language),
      callback_data: "/menu"
    }])
    return [{
      text: `${util.getLabel(labels.chooseMensa, user.language)} (${date})`,
      mode: util.editMode,
      inline_keyboard
    }]
  })
}

function showDishes({ db, user }, date, mensa) {
  // Show dishes for date and mensa
  let query = { mensa, date }
  return db.collection("dishes").find(query).toArray().then(dishes => {
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
      return db.collection("categories").find().sort({ order: 1 }).toArray().then(categories => {
        let text = `*${util.getLabel(labels.dishes, user.language)} ${mensa} (${date}):*`
        for (let category of categories) {
          let dish = dishes.find(d => d.category == category._id)
          if (!dish) continue
          let categoryTitle = category.labels[0]
          dishTitle = util.getLabel(dish.title, user.language)
          text += `\n*${categoryTitle}:* ${dishTitle} (${dish.additives.join(",")})`
        }
        inline_keyboard.push(keyboardBack)
        return [{
          text: text,
          mode: util.editMode,
          inline_keyboard
        }]
      })
    }
  })
}

module.exports = {
  handler,
  commands: ["/show"]
}