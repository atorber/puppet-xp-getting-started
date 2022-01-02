const mqtt = require('mqtt')
import { v4 as uuidv4 } from 'uuid'

class Bot {

    constructor(host, port, username, password, clientId) {
        this.mqttclient = mqtt.connect(`${host}:${port}`, {
            username: username,
            password: password,
            clientId: clientId + randomRange(1, 10000),
        })
        this.isConnected = ''

    }

    init() {
        this.mqttclient.on('connect', function () {
            this.isConnected = true

            console.debug('connect to Wechaty mqtt----------')
            mqttclient.subscribe(`aibotk/${userId}/+`, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        })
        this.mqttclient.on('reconnect', function (e) {
            console.log('subscriber on reconnect')
        })
        this.mqttclient.on('disconnect', function (e) {
            console.log('disconnect--------', e)
            this.isConnected = false
        })
        this.mqttclient.on('error', function (e) {
            console.debug('error----------', e)
        })
        this.mqttclient.on('message', async function (topic, message) {
            const content = JSON.parse(message.toString())
            if (topic === `aibotk/${userId}/say`) {
                if (content.target === 'Room') {
                    console.log(`收到群：${content.roomName}发送消息请求： ${content.message.content || content.message.url}`)
                    const room = await that.Room.find({ topic: content.roomName })
                    if (!room) {
                        console.log(`查找不到群：${content.roomName}，请检查群名是否正确`)
                        return
                    } else {
                        await roomSay(room, '', content.message)
                    }
                } else if (content.target === 'Contact') {
                    console.log(`收到联系人：${content.alias || content.name}发送消息请求： ${content.message.content || content.message.url}`)
                    let contact = (await that.Contact.find({ alias: content.alias })) || (await that.Contact.find({ name: content.name })) || (await that.Contact.find({ weixin: content.weixin })) // 获取你要发送的联系人
                    if (!contact) {
                        console.log(`查找不到联系人：${content.name || content.alias}，请检查联系人名称是否正确`)
                        return
                    } else {
                        await contactSay(contact, content.message)
                    }
                }
            } else if (topic === `aibotk/${userId}/event`) {
                if (content.target === 'system') {
                    console.log('触发了内置事件')
                    const eventName = content.event
                    const res = await dispatchEventContent(that, eventName)
                    console.log('事件处理结果', res[0].content)
                } else if (content.target === 'Room') {
                    console.log('触发了群事件')
                    await sendRoomTaskMessage(that, content)
                } else if (content.target === 'Contact') {
                    console.log('触发了好友事件')
                    await sendContactTaskMessage(that, content)
                }
            }
        })
    }

    pub_property(params) {

    }

    pub_event(params) {

    }

    sub_command(params) {

    }

    propertyMessage(name, info) {
        let message = {
            "reqId": uuidv4(),
            "method": "thing.property.post",
            "version": "1.0",
            "timestamp": new Date().getTime(),
            "properties": {
            }
        }
        message.properties[name] = info

        return message
    }

    commandMessage(name, params) {
        let message = {
            "reqId": uuidv4(),
            "method": "thing.command.invoke",
            "version": "1.0",
            "timestamp": new Date().getTime(),
            "name": name,
            "params": params
        }
        return message
    }

    eventMessage(name, info) {
        let message = {
            "reqId": uuidv4(),
            "method": "thing.event.post",
            "version": "1.0",
            "timestamp": new Date().getTime(),
            "events": {
            }
        }
        message.events[name] = info
        return message
    }

}

module.exports = {
    Bot
}