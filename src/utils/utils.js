import { storageKey } from '@/data/mw4/saveContract'
import { parseSave } from '@/data/mw4/save'
const downloadJsonFile = (json, token) => {
  if (!token) token = 'divergence-mw4'
  const dataStr = json
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const date = new Date().toLocaleDateString('sv-SE')
  const time = new Date().toLocaleTimeString('sv-SE').replace(/:/g, '-')
  const fileName = `${token}_${date}_${time}.json`
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', fileName)
  linkElement.click()
}

const getStoredLocale = () => {
  try {
    const raw = localStorage.getItem(storageKey(import.meta.env.PROD))
    return raw ? parseSave(raw).preferences.locale : 'en-GB'
  } catch {
    return 'en-GB'
  }
}

const updateHtmlLocaleAttributes = (locale) => {
  const htmlTag = document.querySelector('html')

  if (htmlTag) {
    htmlTag.setAttribute('lang', locale)

    if (locale.includes('ar')) {
      htmlTag.setAttribute('dir', 'rtl')
    } else {
      htmlTag.removeAttribute('dir')
    }
  }
}

export { downloadJsonFile, getStoredLocale, updateHtmlLocaleAttributes }
