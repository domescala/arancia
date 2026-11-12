const fs = require('fs')
const path = require('path')
const sass = require('sass')

const appDir = path.join(__dirname, 'app')
const distDir = path.join(__dirname, 'dist')
const textPath = path.join(__dirname, 'content', 'text.json')

// Legge le variabili (supporta anche chiavi annidate: {{hero.titolo}})
const text = JSON.parse(fs.readFileSync(textPath, 'utf8'))
const get = (obj, key) =>
  key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

// Crea dist se non esiste
fs.mkdirSync(distDir, { recursive: true })

// --- HTML ---
const missing = new Set()
const html = fs
  .readFileSync(path.join(appDir, 'index.html'), 'utf8')
  .replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    const value = get(text, key)
    if (value === undefined) {
      missing.add(key)
      return match // lascia il segnaposto così lo noti
    }
    return String(value)
  })

fs.writeFileSync(path.join(distDir, 'index.html'), html)

// --- SASS ---
const { css } = sass.compile(path.join(appDir, 'style.scss'))
fs.writeFileSync(path.join(distDir, 'style.css'), css)

// --- Report ---
console.log('Build completata: dist/index.html, dist/style.css')
if (missing.size) {
  console.warn('Variabili non trovate in text.json:', [...missing].join(', '))
}