const util = require("../util")

function getMensen(db) {
  return db.collection("mensen").find().sort({ order: 1 }).toArray()
}

function getUsers(db) {
  return db.collection("users").find().toArray()
}

function mensenToKeyboard(mensen, prefix) {
  let inline_keyboard = [[]]
  for (let mensa of mensen) {
    if (inline_keyboard[inline_keyboard.length - 1].length >= 2) {
      inline_keyboard.push([])
    }
    inline_keyboard[inline_keyboard.length - 1].push({
      text: mensa._id,
      callback_data: prefix + util.divider + mensa._id
    })
  }
  return inline_keyboard
}

function getCategories(db) {
  return db.collection("categories").find().sort({ order: 1 }).toArray()
}

function categoriesToKeyboard(categories, prefix, user) {
  let inline_keyboard = [[]]
  for (let category of categories) {
    if (!category.labels || !category.labels.length) continue
    if (inline_keyboard[inline_keyboard.length - 1].length >= 2) {
      inline_keyboard.push([])
    }
    let checkmark = !user ? "" : (user.subscriptions.includes(category._id) ? "✅ " : "❌ ")
    inline_keyboard[inline_keyboard.length - 1].push({
      text: checkmark + category.labels[0],
      callback_data: prefix + util.divider + category._id
    })
  }
  return inline_keyboard
}

function getDishes(db, query) {
  return db.collection("dishes").find(query || {}).toArray()
}


module.exports = {
  getMensen, getCategories, getDishes, getUsers,
  mensenToKeyboard,categoriesToKeyboard,
}