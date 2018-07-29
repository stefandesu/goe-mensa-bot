let collection = "users"

function get(db, _id) {
  return db.collection(collection).findOne({ _id }).then(user => {
    if (!user) {
      user = {
        _id,
        enabled: true,
        language: "de",
        priceType: "stu",
        subscriptions: [],
        subscriptionTime: 8,
        subscriptionDays: null,
        filters: {
          additives: [],
          dish_types: []
        },
        keywords: []
      }
    }
    return user
  })
}

function save(db, user) {
  return db.collection(collection).update({ _id: user._id }, user, { upsert : true })
}

module.exports = {
  get, save
}