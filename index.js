const {
    Contact,
    log,
    Message,
    ScanStatus,
    WechatyBuilder,
    UrlLink,
    MiniProgram,
    MessageType
} = require("wechaty");

const {
    PuppetXp
} = require('wechaty-puppet-xp')

const {
    FileBox
} = require('file-box')

const name = 'wechaty-puppet-xp';
const puppet = new PuppetXp()

const bot = WechatyBuilder.build({
    name,
    puppet,
});

async function onMessage(message) {
    console.log(`RECV: ${message}`)
    const talker = message.talker()
    const to = message.to()
    const type = message.type()
    const text = message.text()
    let messageType = ''
    let textBox = ''
    try {
        if (type === bot.Message.Type.Unknown) {
            messageType = 'Unknown'
            textBox = '未知的消息类型'
        }
        if (type === bot.Message.Type.Attachment) {
            messageType = 'Attachment'
            let file = await message.toFileBox()
            const base64 = await file.toBase64()
            textBox = FileBox.fromBase64(base64, file.name)
        }
        if (type === bot.Message.Type.Audio) {
            messageType = 'Audio'
            let file = await message.toFileBox()
            const base64 = await file.toBase64()
            textBox = FileBox.fromBase64(base64, file.name)
        }
        if (type === bot.Message.Type.Contact) {
            messageType = 'Contact'
            // textBox = await message.toContact()
            textBox = '联系人'
        }
        if (type === bot.Message.Type.Emoticon) {
            messageType = 'Emoticon'
            let file = await message.toFileBox()
            const base64 = await file.toBase64()
            textBox = FileBox.fromBase64(base64, file.name)
        }
        if (type === bot.Message.Type.Image) {
            messageType = 'Image'
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            await delay(300);
            let file = await message.toFileBox()
            const base64 = await file.toBase64()
            textBox = FileBox.fromBase64(base64, file.name)
        }
        if (type === bot.Message.Type.Text) {
            messageType = 'Text'
            textBox = '文本信息'
        }
        if (type === bot.Message.Type.Video) {
            messageType = 'Video'
            let file = await message.toFileBox()
            const base64 = await file.toBase64()
            textBox = FileBox.fromBase64(base64, file.name)
        }
        if (type === bot.Message.Type.Url) {
            messageType = 'Url'
            textBox = await message.toUrlLink()
        }
        if (type === bot.Message.Type.MiniProgram) {
            messageType = 'MiniProgram'
            textBox = await message.toMiniProgram()
        }

        console.debug('textBox:', textBox)

        let room = message.room() || {}
        room = JSON.parse(JSON.stringify(room))
        // console.log(room)

        if (room && room.id) {
            delete room._payload.memberIdList
        }

        let payload = {
            talker,
            to,
            room,
            type,
            messageType,
            text,
            message,
            textBox
        }
        console.debug(payload)  

        // ding/dong test
        if (/^dong$/i.test(message.text())) {
            await message.say('dong')
        }
    } catch (err) {
        console.error(err)
    }

}
bot
    .on("scan", (qrcode, status) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, {
                small: true
            }) // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    })
    .on("login", (user) => {
        log.info("TestBot", `${user} login`);
    })
    .on("logout", (user, reason) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
    })
    .on("heartbeat", (data) => {
        console.debug('on heartbeat:',data)

    })
    .on("ready", async () => {
        console.debug('on ready')

    })
    .on("message", onMessage)
    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
    })

bot
    .start()
    .then(() => {
        return log.info('StarterBot', 'Starter Bot Started.')
    })
    .catch(console.error)


