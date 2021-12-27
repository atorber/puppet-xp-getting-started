/**
 *   https://github.com/atorber
 *
 *   @copyright 2016-now atorber <atorber@163.com>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
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

const qrcodeTerminal = require('qrcode-terminal');

const {
    PuppetXp
} = require('wechaty-puppet-xp')

const {
    FileBox
} = require('file-box')

const moment = require('moment')
const mqtt = require('mqtt')

// protobuf相关配置
var protobuf = require('protobufjs');
var messageConfig = require('./message');
var MessageRoot = protobuf.Root.fromJSON(messageConfig);
var MessageMessage = MessageRoot.lookupType("Message");

function set_pb_msg(payload) {
    if (payload.events) {
        payload.events = JSON.stringify(payload.events)
    }
    if (payload.properties) {
        payload.properties = JSON.stringify(payload.properties)
    }
    payload.timestamp = String(payload.timestamp)
    // console.debug(payload)
    var message = MessageMessage.create(payload);
    var buffer = MessageMessage.encode(message).finish();
    // console.log("buffer", buffer);
    return buffer
}

// 维格表相关配置
const {
    VikaBot
} = require('./vika')
const VIKA_TOKEN = ''
let vika = new VikaBot(VIKA_TOKEN)

let secret = {}
let reportList = []
let events_topic = ''
let msg_topic = ''
let mqttclient = ''

// 机器人相关配置
const puppet_used = 0 //切换puppet，0-puppet-wechat 1-puppet-xp
const name = 'mp-chat';
let puppet

switch (puppet_used) {
    case 0:
        puppet = 'wechaty-puppet-wechat'
        break;
    case 1:
        puppet = new PuppetXp()
        break;
    default:
        puppet = 'wechaty-puppet-wechat'
}

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

    const roomList = await bot.Room.findAll()
    // console.info('roomList', JSON.stringify(roomList))
    const userSelf = await bot.currentUser
    console.debug(userSelf)
    let curTime = getCurTime()
    // mqtt_pub(getEventsMsg('ready', { contactList, roomList, userSelf, lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))
    mqtt_pub(getPropertyMsg({ userSelf }))
    mqtt_pub(getPropertyMsg({ lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))

    mqtt_pub(getPropertyMsg({ contactList }))
    mqtt_pub(getPropertyMsg({ roomList }))

    vika.updateBot('userSelf', JSON.stringify(userSelf))
    vika.updateBot('lastUpdate', JSON.stringify(curTime))
    vika.updateBot('timeHms', JSON.stringify(moment(curTime).format("YYYY-MM-DD HH:mm:ss")))
    vika.updateBot('contactList', JSON.stringify(contactList))
    vika.updateBot('roomList', JSON.stringify(roomList))

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

    return time
}

function getEventsMsg(eventName, msg) {
    let events = {}
    events[eventName] = msg
    let curTime = getCurTime()
    let reqId = guid()
    let timeHms = moment(curTime).format("YYYY-MM-DD HH:mm:ss")
    let _payload = {
        "reqId": reqId,
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": curTime,
        "timeHms": timeHms,
        "events": events
    }

    let records = [
        {
            "fields": {
                "ID": reqId,
                "时间": timeHms,
                "来自": msg.talker._payload ? (msg.talker._payload.name || '我') : '--',
                "接收": msg.room.id ? msg.room._payload.topic : '单聊',
                "内容": msg.text,
                "发送者ID": msg.talker.id != 'null' ? msg.talker.id : '--',
                "接收方ID": msg.room.id ? msg.room.id : '--',
            }
        }
    ]
    if (reportList.indexOf(msg.room.id) != -1 || !msg.room.id) {
        vika.addChatRecord(records)
    }
    // _payload = JSON.stringify(_payload)
    _payload = set_pb_msg(_payload)
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
    // _payload = JSON.stringify(_payload)
    _payload = set_pb_msg(_payload)
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

async function main() {
    let botConfig = await vika.checkInit()
    console.debug(botConfig)
    secret = botConfig.secret
    reportList = botConfig.reportList

    const DeviceKey = secret.mqtt.DeviceKey
    const username = secret.mqtt.username
    const password = secret.mqtt.password
    const clientid = DeviceKey
    const host = secret.mqtt.host
    const port = 1883
    events_topic = `$iot/${DeviceKey}/events`
    msg_topic = `$iot/${DeviceKey}/msg`
    try {
        mqttclient = mqtt.connect(`mqtt://${host}:${port}`, {
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
            console.debug('message------------------------------------------------', message)
            try {
                // let message_json = JSON.parse(message.toString())

                let message_json = MessageMessage.decode(message);
                console.debug(message_json)
                message_json.params = JSON.parse(message_json.params)
                message_json.timestamp = Number(message_json.timestamp)

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

