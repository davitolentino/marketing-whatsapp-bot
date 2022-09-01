const { Client, LocalAuth } = require('whatsapp-web.js')

const reader = require('xlsx')
let data = []

try {
  const file = reader.readFile('./planilha.xlsx')

  const sheets = file.SheetNames

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
    temp.forEach((res) => {
      data.push(res)
    })
  }
} catch (err) {
  console.log('Erro')
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
})

let isReady = false

client.initialize()

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr)
})

client.on('ready', async () => {
  console.log('READY')
  isReady = true
})

client.on('message', async (msg) => {
  console.log(msg)
})

const cron = require('node-cron')
const { format } = require('date-fns')
const { join } = require('path')
const { messageMediaFromFilePath } = require('./utils/messageMedia')

cron.schedule('* * * * *', async (date) => {
  if (!isReady) return

  try {
    const time = format(new Date(date), 'HH:mm')
    const chats = await client.getChats()

    if (time === '16:27' && chats.length > 0) {
      for (const chat of chats) {
        for (const planilha of data)
          if (String(chat.id.user).includes(planilha.numero) && !chat.isGroup) {
            let media = null

            try {
              media = messageMediaFromFilePath(
                join(__dirname, '..', 'pao_de_mel.jpg'),
              )
            } catch (err) {}

            console.log(media)
            chat.sendMessage(planilha.texto, { ...(media && { media }) })
          }
      }
    }
  } catch (err) {
    console.log(err)
  }
})
