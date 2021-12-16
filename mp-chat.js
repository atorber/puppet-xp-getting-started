/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016-now Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
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

const moment = require('moment')
const mqtt = require('mqtt')

const IoTCoreId = 'alvxdkj'
const DeviceKey = '7813159edb154cb1a5c7cca80b82509f'
const DeviceSecret = ''

const username = IoTCoreId + '/' + DeviceKey
const password = DeviceSecret
const clientid = DeviceKey
const host = `${IoTCoreId}.iot.gz.baidubce.com`
const events_topic = `$iot/${DeviceKey}/events`
const msg_topic = `$iot/${DeviceKey}/msg`
let mqttclient = ''

const name = 'mp-chat';
const puppet = new PuppetXp()

const bot = WechatyBuilder.build({
    name,
    puppet,
});

function onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')

        log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    } else {
        log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
    }
}

async function onLogin(user) {
    log.info('StarterBot', '%s login', user)
    let contactList = await bot.Contact.findAll()
    let friend_contactList = []
    let unfriend_contactList = []

    // console.info('contactList', JSON.stringify(contactList))

    for (let i = 0; i < contactList.length; i++) {
        if (contactList[i].friend()) {
            // console.debug(contactList[i])
            friend_contactList.push(contactList[i])
        } else {
            // console.debug(contactList[i].id)
            unfriend_contactList.push(contactList[i])
        }
    }
    // console.debug(unfriend_contactList)

    console.debug(friend_contactList.length, unfriend_contactList.length)

    contactList = friend_contactList
    mqtt_pub(getPropertyMsg({ contactList }))

    const roomList = await bot.Room.findAll()
    // console.info('roomList', JSON.stringify(roomList))
    const userSelf =await bot.currentUser()
    console.debug(userSelf)
    let curTime = getCurTime()
    // mqtt_pub(getEventsMsg('ready', { contactList, roomList, userSelf, lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))
    mqtt_pub(getPropertyMsg({ roomList }))
    mqtt_pub(getPropertyMsg({ userSelf }))
    mqtt_pub(getPropertyMsg({ lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))

}

async function onReady() {
    let contactList = await bot.Contact.findAll()
    let friend_contactList = []
    let unfriend_contactList = []

    // console.info('contactList', JSON.stringify(contactList))

    for (let i = 0; i < contactList.length; i++) {
        if (contactList[i].friend()) {
            // console.debug(contactList[i])
            friend_contactList.push(contactList[i])
        } else {
            // console.debug(contactList[i].id)
            unfriend_contactList.push(contactList[i])
        }
    }
    // console.debug(unfriend_contactList)

    console.debug(friend_contactList.length, unfriend_contactList.length)

    // contactList = friend_contactList
    mqtt_pub(getPropertyMsg({ contactList }))

    const roomList = await bot.Room.findAll()
    // console.info('roomList', JSON.stringify(roomList))
    const userSelf = await bot.Contact.find(bot.currentUser)
    console.debug(userSelf)
    let curTime = getCurTime()
    // mqtt_pub(getEventsMsg('ready', { contactList, roomList, userSelf, lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))
    mqtt_pub(getPropertyMsg({ roomList }))
    mqtt_pub(getPropertyMsg({ userSelf }))
    mqtt_pub(getPropertyMsg({ lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))

}

function onLogout(user) {
    log.info('StarterBot', '%s logout', user)
}

async function onMessage(message) {
    // console.debug(message)

    const talker = message.talker()
    const to = message.to()
    const type = message.type()
    const text = message.text()
    let messageType = ''
    let textBox = ''
    if (type === bot.Message.Type.Unknown) {
        messageType = 'Unknown'
        textBox = '未知的消息类型'
    }
    if (type === bot.Message.Type.Attachment) {
        messageType = 'Attachment'
        // textBox = await message.toFileBox()
    }
    if (type === bot.Message.Type.Audio) {
        messageType = 'Audio'
        // textBox = await message.toFileBox()
    }
    if (type === bot.Message.Type.Contact) {
        messageType = 'Contact'
        // textBox = await message.toContact()
    }
    if (type === bot.Message.Type.Emoticon) {
        messageType = 'Emoticon'
        // textBox = '表情符号'
    }
    if (type === bot.Message.Type.Image) {
        messageType = 'Image'
        // textBox = await message.toFileBox()
    }
    if (type === bot.Message.Type.Text) {
        messageType = 'Text'
        textBox = '文本信息'
    }
    if (type === bot.Message.Type.Video) {
        messageType = 'Video'
        // textBox = await message.toFileBox()
    }
    if (type === bot.Message.Type.Url) {
        messageType = 'Url'
        // textBox = await message.toUrlLink()
    }

    console.debug('textBox:', textBox)

    let room = message.room() || {}
    room = JSON.parse(JSON.stringify(room))

    if (room && room.id) {
        delete room._payload.memberIdList
    }

    let _payload = {
        talker,
        to,
        room,
        type,
        messageType,
        text,
        message,
        textBox
    }
    console.debug(_payload)
    _payload = JSON.stringify(_payload)
    _payload = JSON.parse(_payload)

    // mqttclient.publish(eventPost, getEventsMsg('message', _payload));

    if (!message.self()) {
        mqtt_pub(getEventsMsg('message', _payload))
    } else {
        mqtt_pub(getEventsMsg('message', _payload))
    }

    // ding/dong test
    if (/^dong$/i.test(message.text())) {
        await message.say('dong')
    }
}

function getCurTime() {
    //timestamp是整数，否则要parseInt转换
    let timestamp = new Date().getTime()
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var time = timestamp + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000

    // var y = time.getFullYear();
    // var m = time.getMonth() + 1;
    // var d = time.getDate();
    // var h = time.getHours();
    // var mm = time.getMinutes();
    // var s = time.getSeconds();
    // var ms = time.getMilliseconds();
    // var sTime = y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
    // var msTime = sTime + '.' + ms;

    return time
}

function getEventsMsg(eventName, msg) {
    let events = {}
    events[eventName] = msg
    let curTime = getCurTime()
    let _payload = {
        "reqId": guid,
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": curTime,
        timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss"),
        "events": events
    }
    _payload = JSON.stringify(_payload)
    // console.debug(eventName)
    // print(eventName, _payload)
    return _payload
}

function getPropertyMsg(datas_json) {
    let curTime = getCurTime()
    let _payload = {
        "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method": "thing.property.post",
        "version": "1.0",
        "timestamp": curTime,
        timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss"),
        "properties": datas_json
    }
    _payload = JSON.stringify(_payload)
    // console.debug(eventName)
    // print(eventName, _payload)
    return _payload
}

async function sendAt(bot, params) {
    /*   {
      "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method":"thing.command.invoke",
      "version":"1.0",
      "timestamp":1610430718000,
      "name":"sendAt",
      "params":{
          "room":"5550027590@chatroom",
          "toContacts":[
              "tyutluyc"
          ],
          "messagePayload":"welcome to wechaty!"
      }
  } */
    let atUserIdList = params.toContacts
    let room = await bot.Room.find({ id: params.room })
    const atUserList = [];
    for (const userId of atUserIdList) {
        const cur_contact = await bot.Contact.load(userId);
        atUserList.push(cur_contact);
    }
    await room.say(params.messagePayload, ...atUserList)
}

async function send(bot, params) {
    console.debug(typeof (params))
    console.debug(params)

    let msg = ''
    if (params.messageType == 'Text') {
        /* {
      "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method":"thing.command.invoke",
      "version":"1.0",
      "timestamp":1610430718000,
      "name":"send",
      "params":{
          "toContacts":[
              "tyutluyc",
              "5550027590@chatroom"
          ],
          "messageType":"Text",
          "messagePayload":"welcome to wechaty!"
      }
    } */
        msg = params.messagePayload

    } else if (params.messageType == 'Contact') {
        /* {
          "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
          "method":"thing.command.invoke",
          "version":"1.0",
          "timestamp":1610430718000,
          "name":"send",
          "params":{
              "toContacts":[
                  "tyutluyc",
                  "5550027590@chatroom"
              ],
              "messageType":"Contact",
              "messagePayload":"tyutluyc"
          }
      } */
        const contactCard = await bot.Contact.find({ id: params.messagePayload })
        if (!contactCard) {
            console.log('not found')
            return {
                msg: '无此联系人'
            }
        } else {
            msg = contactCard
        }

    } else if (params.messageType == 'Attachment') {
        /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Attachment",
            "messagePayload":"/tmp/text.txt"
        }
    } */
        if (params.messagePayload.indexOf('http') != -1 || params.messagePayload.indexOf('https') != -1) {
            msg = FileBox.fromUrl(params.messagePayload)
        } else {
            msg = FileBox.fromFile(params.messagePayload)
        }


    } else if (params.messageType == 'Image') {
        /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Image",
            "messagePayload":"https://wechaty.github.io/wechaty/images/bot-qr-code.png"
        }
    } */
        // msg = FileBox.fromUrl(params.messagePayload)
        if (params.messagePayload.indexOf('http') != -1 || params.messagePayload.indexOf('https') != -1) {
            msg = FileBox.fromUrl(params.messagePayload)
        } else {
            msg = FileBox.fromFile(params.messagePayload)
        }

    } else if (params.messageType == 'Url') {
        /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Url",
            "messagePayload":{
                "description":"WeChat Bot SDK for Individual Account, Powered by TypeScript, Docker, and Love",
                "thumbnailUrl":"https://avatars0.githubusercontent.com/u/25162437?s=200&v=4",
                "title":"Welcome to Wechaty",
                "url":"https://github.com/wechaty/wechaty"
            }
        }
    } */
        msg = new UrlLink(params.messagePayload)

    } else if (params.messageType == 'MiniProgram') {
        /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"MiniProgram",
            "messagePayload":{
                "appid":"wx36027ed8c62f675e",
                "description":"群组大师群管理工具",
                "title":"群组大师",
                "pagePath":"pages/start/relatedlist/index.html",
                "thumbKey":"",
                "thumbUrl":"http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0",
                "username":"gh_6c52e2baeb2d@app"
            }
        }
    } */
        msg = new MiniProgram(params.messagePayload)

    } else {
        return {
            msg: '不支持的消息类型'
        }
    }

    const toContacts = params.toContacts

    for (let i = 0; i < toContacts.length; i++) {
        if (toContacts[i].split('@').length == 2) {
            console.debug(`向群${toContacts[i]}发消息`)
            let room = await bot.Room.find({ id: toContacts[i] })
            if (room) {
                try {
                    await room.say(msg)
                } catch (err) {
                    console.error(err)
                }
            }
        } else {
            console.debug(`好友${toContacts[i]}发消息`)
            let contact = await bot.Contact.find({ id: toContacts[i] })
            if (contact) {
                try {
                    await contact.say(msg)
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }

}

function mqtt_pub(datas_jsonstr) {
    mqttclient.publish(events_topic, datas_jsonstr);
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function main() {
    try {
        mqttclient = mqtt.connect(`mqtt://${host}:1883`, {
            username,
            password,
            clientId: clientid
        })
        mqttclient.on('connect', function () {
            console.debug('connect------------------------------------------------')
            mqttclient.subscribe(msg_topic, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('订阅topic成功' + msg_topic)

                    bot.start()
                        .then(() => log.info('StarterBot', 'Starter Bot Started.'))
                        .catch(e => log.error('StarterBot', e))

                }
            })
        })
        mqttclient.on('message', async function (topic, message) {
            console.debug('message------------------------------------------------')
            try {
                let message_json = JSON.parse(message.toString())
                console.debug(message_json)
                if (message_json.name == 'send') {
                    send(bot, message_json.params)
                }
                if (message_json.name == 'sendAt') {
                    sendAt(bot, message_json.params)
                }

            } catch (err) {
                console.error(err)
            }

        })

        bot
            .on("scan", onScan)
            .on("login", onLogin)
            .on("logout", onLogout)
            .on("message", onMessage)
            .on("ready", onReady)
            .on("error", (error) => {
                log.error("TestBot", 'on error: ', error.stack);
                // mqttclient.publish(eventPost, getEventsMsg('error', { error }));
                // mqtt_pub(getEventsMsg('error', { error }))

            })

        bot
            .start()
            .then(() => {
                log.info("TestBot", "started.");
            }).catch(e => log.error('StarterBot', e));


    } catch (err) {
        console.error(err)
    }
}

main()

