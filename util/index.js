function getLabel(label, lang) {
  let defaultLang = "de"
  return label[lang] || label[defaultLang] || ""
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
}