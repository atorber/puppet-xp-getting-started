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

const { Device } = require('./mp-chat/bot')
const { Contact, log, Message, ScanStatus, WechatyBuilder, UrlLink, MiniProgram, MessageType
} = require("wechaty");
const qrcodeTerminal = require('qrcode-terminal');
const { PuppetXp } = require('wechaty-puppet-xp')
const moment = require('moment')

// 维格表相关配置
const {
    VikaBot
} = require('./mp-chat/vika')
const VIKA_TOKEN = '替换为维格表token'
let vika = new VikaBot(VIKA_TOKEN)

let secret
let reportList
let device

// 机器人相关配置
const puppet_used = 1 //切换puppet，0-puppet-wechat 1-puppet-xp
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

    // mqtt_pub(getPropertyMsg({ userSelf }))
    // mqtt_pub(getPropertyMsg({ lastUpdate: curTime, timeHms: moment(curTime).format("YYYY-MM-DD HH:mm:ss") }))
    // mqtt_pub(getPropertyMsg({ contactList }))
    // mqtt_pub(getPropertyMsg({ roomList }))

    device.pub_property('userSelf', userSelf)
    device.pub_property('lastUpdate', curTime)
    device.pub_property('timeHms', moment(curTime).format("YYYY-MM-DD HH:mm:ss"))
    device.pub_property('contactList', contactList)
    device.pub_property('roomList', roomList)


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
    // mqtt_pub(getPropertyMsg({ contactList }))

    const roomList = await bot.Room.findAll()
    // console.info('roomList', JSON.stringify(roomList))
    const userSelf = await bot.Contact.find(bot.currentUser)
    console.debug(userSelf)

}

function onLogout(user) {
    log.info('StarterBot', '%s logout', user)
}

async function onMessage(message) {
    // console.debug(message)
    let room = message.room() || {}
    device.pub_message(message)

    if (!room.id || reportList.indexOf(room.id) != -1) {
        vika.addChatRecord(message)
    }

    // ding/dong test
    if (/^ding$/i.test(message.text())) {
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

async function main() {
    let botConfig = await vika.checkInit()
    console.debug(botConfig)
    secret = botConfig.secret
    reportList = botConfig.reportList

    const username = secret.mqtt.username
    const password = secret.mqtt.password
    const clientId = secret.mqtt.DeviceKey
    const host = secret.mqtt.host
    const port = 1883

    device = new Device(host, port, username, password, clientId)
    device.init()

    bot
        .on("scan", onScan)
        .on("login", onLogin)
        .on("logout", onLogout)
        .on("message", onMessage)
        .on("ready", onReady)
        .on("error", (error) => {
            log.error("TestBot", 'on error: ', error.stack);
        })
        .start()
        .then(() => {
            log.info("TestBot", "started.");
        })
        .catch(e => log.error('StarterBot', e));
    device.sub_command(bot)
}

// 运行主程序
main()

