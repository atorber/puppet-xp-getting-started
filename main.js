const {
    Contact,
    log,
    Message,
    ScanStatus,
    Wechaty,
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

const moment = require('moment')

const name = 'wechaty-puppet-xp';
const puppet = new PuppetXp()

const bot = new Wechaty({
    name,
    puppet,
});

function pub_msg(payload) {
    console.debug(payload)
}

function pub_property() {
    console.debug(payload)
}

function getEventsMsg(eventName, msg) {
    let events = {}
    events[eventName] = msg
    let curTime = getCurTime()
    let payload = {
        "reqId": guid,
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": curTime,
        timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss"),
        "events": events
    }
    payload = JSON.stringify(payload)
    // console.debug(eventName)
    return payload
}

function getCurTime() {
    let timestamp = new Date().getTime()
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var time = timestamp + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000
    return time
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

bot
    .on("scan", (qrcode, status) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            pub_property({
                qrcodeImageUrl
            })

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
        if (heartbeatCount % 20 == 0) {
            let curTime = getCurTime()
            pub_property({
                lastUpdate: curTime,
                timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss")
            })
        }
        heartbeatCount = heartbeatCount + 1
    })
    .on("ready", async () => {
        let curTime = getCurTime()
        pub_msg(getEventsMsg('ready', {
            lastUpdate: curTime,
            timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss")
        }))
    })
    .on("message", async (message) => {

        // console.debug(message)
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

            if (room && room.id) {
                delete room.payload.memberIdList
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
            payload = JSON.stringify(payload)
            payload = JSON.parse(payload)

            if (!message.self()) {
                pub_msg(getEventsMsg('message', payload))
            } else {
                pub_msg(getEventsMsg('message', payload))
            }

            // ding/dong test
            if (/^dong$/i.test(message.text())) {
                await message.say('dong')
            }
        } catch (err) {
            console.error(err)
        }

    })
    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
        pub_msg(getEventsMsg('error', {
            error
        }))

    })

bot
    .start()
    .then(() => {
        log.info("TestBot", "started.");
    });
