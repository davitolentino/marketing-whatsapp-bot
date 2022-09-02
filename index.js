const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const { join } = require("path");
const { messageMediaFromFilePath } = require("./utils/messageMedia");
const { sleep } = require("./utils/sleep");

const reader = require("xlsx");
let data = [];
let haveSend = false;
let finishSend = false;
const pathXlsx = "./Contatos.xlsx";
const pathImage = join(__dirname, "imagem.jpeg");
const timeToSendMessage = 5000;

try {
  const file = reader.readFile(pathXlsx);

  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res);
    });
  }
} catch (err) {
  console.log("Erro");
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

let isReady = false;

client.initialize();

client.on("ready", async () => {
  console.log("READY");
  isReady = true;
});

cron.schedule("* * * * *", async () => {
  if (haveSend && finishSend) return console.log("Já pode fechar a aplicação");
  if (!isReady || haveSend) return;
  haveSend = true;

  try {
    for (const planilha of data) {
      if (planilha.Numero) {
        let media = null;

        try {
          media = messageMediaFromFilePath(pathImage);
        } catch (err) {
          console.log(err);
        }

        await client.sendMessage(`${planilha.Numero}@c.us`, planilha.Mensagem, {
          ...(media && { media }),
        });

        await sleep(timeToSendMessage);
      }
    }
  } catch (err) {
    console.log(err);
  }
  finishSend = true;
  haveSend = true;
});
