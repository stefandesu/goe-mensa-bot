function getLabel(label, lang) {
  let defaultLang = "de"
  return label[lang] || label[defaultLang] || ""
}

function weekday(date) {
  let d = new Date()
  try {
    d.setTime(Date.parse(date))
    return d.getDay()
  } catch(error) {
    return null
  }
}

const weekdays = [
  {
    de: "Sonntag",
    en: "Sunday"
  },
  {
    de: "Montag",
    en: "Monday"
  },
  {
    de: "Dienstag",
    en: "Tuesday"
  },
  {
    de: "Mittwoch",
    en: "Wednesday"
  },
  {
    de: "Donnerstag",
    en: "Thursday"
  },
  {
    de: "Freitag",
    en: "Friday"
  },
  {
    de: "Samstag",
    en: "Saturday"
  }
]

function weekdayLabel(date, lang) {
  let wd = weekday(date)
  let label = wd && weekdays[wd]
  return label ? getLabel(label, lang) : ""
}

module.exports = {
  divider: "&&",
  sendMode: "SEND",
  editMode: "EDIT",
  backText: {
    de: "« zurück",
    en: "« back"
  },
  getLabel,
  weekdays,
  weekday,
  weekdayLabel,
}