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

        pub_msg(getEventsMsg('scan', {
            qrcode,
            status
        }))

    })
    .on("login", (user) => {
        log.info("TestBot", `${user} login`);

        pub_msg(getEventsMsg('login', {
            user
        }))

    })
    .on("logout", (user, reason) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);

        pub_msg(getEventsMsg('logout', {
            user,
            reason
        }))
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
    .on('friendship', async (friendship) => {
        let contact = friendship.contact()
        if (friendship.type() === bot.Friendship.Type.Receive) { // 1. receive new friendship request from new contact
            let result = await friendship.accept()
            if (result) {
                console.log(`Request from ${contact.name()} is accept succesfully!`)
                let msg = `nice to meet you~`
                await contact.say(msg)

            } else {
                console.log(`Request from ${contact.name()} failed to accept!`)

            }

        } else if (friendship.type() === bot.Friendship.Type.Confirm) { // 2. confirm friendship
            console.log(`New friendship confirmed with ${contact.name()}`)
            let msg = `nice to meet you~`
            await contact.say(msg)

        }

        pub_msg(getEventsMsg('friendship', {
            friendship
        }))
    })
    .on('room-join', async (room, inviteeList, inviter) => {
        const nameList = inviteeList.map(c => c.name()).join(',')
        console.log(`Room ${await room.topic()} got new member ${nameList}, invited by ${inviter}`)

        pub_msg(getEventsMsg('room-join', {
            room,
            inviteeList,
            inviter
        }))

        let msg = `欢迎@${nameList} 加入群~`
        // room.say(msg)
    })
    .on('room-leave', async (room, leaverList, remover) => {
        const nameList = leaverList.map(c => c.name()).join(',')
        console.log(`Room ${await room.topic()} lost member ${nameList}, the remover is: ${remover}`)

        pub_msg(getEventsMsg('room-leave', {
            room,
            leaverList,
            remover
        }))

        let msg = `很遗憾，${nameList}离开了群~`
        // room.say(msg)

    })
    .on('room-topic', async (room, topic, oldTopic, changer) => {
        console.log(`Room ${await room.topic()} topic changed from ${oldTopic} to ${topic} by ${changer.name()}`)

        pub_msg(getEventsMsg('room-topic', {
            room,
            topic,
            oldTopic,
            changer
        }))

    })
    .on('room-invite', async roomInvitation => {
        try {
            console.log(`received room-invite event.`)
            await roomInvitation.accept()

            pub_msg(getEventsMsg('room-invite', {
                roomInvitation: await roomInvitation.accept()
            }))

        } catch (e) {
            console.error(e)

            pub_msg(getEventsMsg('room-invite', {
                roomInvitation: e
            }))

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
