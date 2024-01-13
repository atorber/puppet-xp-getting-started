# Wechaty Puppet XP Getting Started

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-atorber-brightgreen.svg)](https://github.com/atorber/puppet-xp-getting-started)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/atorber/puppet-xp-getting-started.svg?label=github%20stars)](https://github.com/atorber/puppet-xp-getting-started)
 <img alt="GitHub forks badge" src="https://img.shields.io/github/forks/atorber/puppet-xp-getting-started">

## 简介

本项目是基于开源聊天机器人社区[Wechaty](https://github.com/wechaty)的[puppet-xp](https://github.com/wechaty/puppet-xp)项目开发微信聊天机器人快速入门和最佳实践，支持Windows微信客户端3.3.0.115，3.6.0.18, 3.9.2.23版本。

优点：

- 一键运行，免dll注入
- Wechaty社区支持

## 免责声明

本仓库发布的内容，仅用于学习研究，请勿用于非法用途和商业用途！如因此产生任何法律纠纷，均与作者无关！

运行微信机器人可能会造成封号等后果，。请自行承担风险。仅用于学习研究，请勿于非法用途。

## 功能支持

完全取决于[puppet-xp](https://github.com/wechaty/puppet-xp)项目的支持程度，目前支持的最新微信版本为3.9.2.23，最稳定的版本为3.6.0.18

版本|3.3.0.115|3.6.0.18|3.9.2.23|
:---|:---|:---|:---|
**<消息>**|
接收文本|✅|✅|✅
接收图片|✅|✅|✅
接收文件|✅|✅|✅
接收动图|✅|✅|✅
接收表情|✅|✅|✅
接收小程序卡片|✅|✅|✅
接收联系人卡片|✅|✅|✅
接收位置卡片|✅|✅|✅
发送文本|✅|✅|✅
发送图片|✅|✅|✅
发送文件|✅|✅|✅
发送动图|✅|✅|✅
**<群组>**|
@群成员|✅|✅|✅
群列表|✅|✅|✅
群成员列表|✅|✅|✅
群详情|✅|✅|✅
进群提示|✅|✅|✅
**<联系人>**|
好友列表|✅|✅|✅
好友详情|✅|✅|✅
**<其他>**|
登录事件|✅|✅|✅
扫码登录|||✅

## 快速开始

wechaty-puppet-xp仅支持windows操作系统下使用,微信版本需要于npm包版本对应。快速开始默认使用3.9.2.23版本的微信。

### 1. 检查微信客户端并登陆

检查电脑上微信版本是否是支持的版本（如果不是必须下载指定版，如果是则不需要重新安装），正常**登陆微信**，如当前电脑微信版本不符，需要
[下载WeChatSetup-v3.9.2.23.exe](https://github.com/tom-snow/wechat-windows-versions/releases/download/v3.9.2.23/WeChatSetup-3.9.2.23.exe)

### 2. 安装并检查当前nodejs环境

[下载安装16LTS版本nodejs](https://nodejs.org/)，检查node版本 >= v16.0.0

```
node -v

PS C:\Users\Administrator\Documents\GitHub\wechaty-puppet-xp-demo> node -v
v16.15.0
``` 

### 3. 下载demo代码 [puppet-xp-getting-started](https://github.com/atorber/puppet-xp-getting-started) 

```
git clone https://github.com/atorber/puppet-xp-getting-started
```

### 4.安装依赖

```
cd puppet-xp-getting-started
npm i wechaty-puppet-xp@next
npm install
``` 

> 如安装失败可手动安装puppet-xp，运行`npm i wechaty-puppet-xp@next`

### 5. 启动程序

**确保PC上的微信已处于登录状态状态，确认版本为v3.9.2.23**

```
npm run start
```

显示类似如下，说明启动成功

```
PS C:\Users\Administrator\Documents\GitHub\wechaty-puppet-xp-demo> npm run start

> wechaty-puppet-xp-demo@0.2.2 start
> cross-env NODE_OPTIONS="--no-warnings --loader=ts-node/esm" node ./src/index.ts

01:42:54 INFO options... {"version":"3.9.2.23"}
01:42:57 INFO StarterBot Starter Bot Started.
01:43:12 INFO onLogin Contact<大师> login
01:43:13 INFO 当前登录账号信息： Contact<大师>
01:43:13 INFO 微信号查找联系人： Contact<文件传输助手>
01:43:13 INFO 昵称查找联系人： Contact<文件传输助手>
01:43:13 INFO 备注名称查找联系人： 没有找到联系人
01:43:13 INFO 群ID查找群： Room<大师是群主>
01:43:13 INFO 群名称查找群： Room<大师是群主>
01:43:13 INFO 联系人数量： 6271
01:43:13 INFO 群数量： 53
```

| 运行 | 对应程序 | 说明 |
| :------------- |:-------------| :-----|
| `npm start` | [src/indext.ts](src/index.ts) | ts代码示例 |
| `npm run start:js` | [src/ding-dong-bot.js](examples/ding-dong-bot.js) | js代码示例 |

## 代码示例

```
#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * wechaty-puppet-xp示例代码，可以作为模版编写自己的业务逻辑.
 *  
**/
import 'dotenv/config.js'

import {
    Contact,
    Message,
    ScanStatus,
    WechatyBuilder,
    log,
    types,
} from 'wechaty'

import qrcodeTerminal from 'qrcode-terminal'
import { FileBox } from 'file-box'

const onScan = (qrcode: string, status: ScanStatus) => {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')
        log.info('onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

        qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

    } else {
        log.info('onScan: %s(%s)', ScanStatus[status], status)
    }
}

const onLogin = async (user: Contact) => {
    log.info('onLogin', '%s login', user)
    // 登录成功后调用bot
    main()
}

const onLogout = (user: Contact) => {
    log.info('onLogout', '%s logout', user)
}

const onMessage = async (msg: Message) => {
    log.info('onMessage', JSON.stringify(msg))
    // Message doc : https://wechaty.js.org/docs/api/message#messageage--number

    const talker = msg.talker() // 发消息人
    const listener = msg.listener() // 接收消息人
    const room = msg.room() // 是否是群消息
    const text = msg.text() // 消息内容
    const type = msg.type() // 消息类型
    const self = msg.self() // 是否自己发给自己的消息

    log.info('talker', JSON.stringify(talker))
    log.info('listener', listener||'undefined')
    log.info('room', room || 'undefined')
    log.info('text', text)
    log.info('type', type)
    log.info('self', self?'true':'false')

    try {
        switch (text) {
            case 'ding': // 接收到的消息是ding，回复dong
                await msg.say('dong')
                break
            case 'send text': // 接收到的消息是send text，发送文本消息
                await msg.say('this is a test text')
                break
            case 'send image': // 接收到的消息是send image，发送图片
                const image = FileBox.fromFile('file/ledongmao.jpg')
                await msg.say(image)
                break
            case 'send file': // 接收到的消息是send file，发送文件
                const fileBox = FileBox.fromUrl('https://wechaty.js.org/assets/logo.png')
                await msg.say(fileBox)
                break
            case 'send video': // 接收到的消息是send video，发送视频
                const video = FileBox.fromUrl('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4')
                await msg.say(video)
                break
            case 'send audio': // 接收到的消息是send audio，发送音频
                const audio = FileBox.fromUrl('http://www.zhongguoyinhang.com/upload/2018-11/201811161154314128.mp3')
                await msg.say(audio)
                break
            case 'send emotion': // 接收到的消息是send emotion，发送表情
                const emotion = FileBox.fromUrl('https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/0.gif')
                await msg.say(emotion)
                break
            default:
                break
        }
    } catch (e) {
        console.log('回复消息失败...', e)
    }

    try{
        switch (type) {
            case types.Message.Text: // 接收到的消息是文本
                log.info('接收到的消息是文本')
                log.info('消息内容：', text)
                break
            case types.Message.Image: // 接收到的消息是图片
                log.info('接收到的消息是图片')
                const image = await msg.toImage().thumbnail()  // Save the media message as a FileBox
                const filePath = 'file/' + image.name
                try {
                    image.toFile(filePath, true)
                    log.info(`Saved file: ${filePath}`)
                } catch (e) {
                    log.error('保存文件错误：', e)
                }
                break
            case types.Message.Attachment: // 接收到的消息是附件
                log.info('接收到的消息是附件')
                const attachment = await msg.toFileBox()  // Save the media message as a FileBox
                const attachmentPath = 'file/' + attachment.name
                try {
                    attachment.toFile(attachmentPath, true)
                    log.info(`Saved file: ${attachmentPath}`)
                } catch (e) {
                    log.error('保存文件错误：', e)
                }
                break
            case types.Message.Video: // 接收到的消息是视频
                log.info('接收到的消息是视频')
                const video = await msg.toFileBox()  // Save the media message as a FileBox
                const videoPath = 'file/' + video.name
                try {
                    video.toFile(videoPath, true)
                    log.info(`Saved file: ${videoPath}`)
                } catch (e) {
                    log.error('保存文件错误：', e)
                }
                break
            case types.Message.Audio: // 接收到的消息是音频
                log.info('接收到的消息是音频')
                break
            case types.Message.Emoticon: // 接收到的消息是表情
                log.info('接收到的消息是表情')
                const emoticon = await msg.toFileBox()  // Save the media message as a FileBox
                const emoticonPath = 'file/' + emoticon.name
                try {
                    emoticon.toFile(emoticonPath, true)
                    log.info(`Saved file: ${emoticonPath}`)
                } catch (e) {
                    log.error('保存文件错误：', e)
                }
                break
            case types.Message.Url: // 接收到的消息是链接
                log.info('接收到的消息是链接')
                try {
                    const urlLink = await msg.toUrlLink()
                    log.info('链接标题：', urlLink.title)
                    log.info('链接地址：', urlLink.url)
                } catch (e) {
                    log.error('获取链接错误：', e)
                }
                break
            case types.Message.MiniProgram: // 接收到的消息是小程序
                log.info('接收到的消息是小程序')
                try {
                    const miniProgram = await msg.toMiniProgram()
                    log.info('小程序标题：', miniProgram.title)
                    log.info('小程序描述：', miniProgram.description)
                    log.info('小程序页面地址：', miniProgram.pagePath)
                    log.info('小程序缩略图：', miniProgram.thumbUrl)
                } catch (e) {
                    log.error('获取小程序错误：', e)
                }
                break
            case types.Message.Transfer: // 接收到的消息是转账
                log.info('接收到的消息是转账')
                break
            case types.Message.RedEnvelope: // 接收到的消息是红包
                log.info('接收到的消息是红包')
                break
            case types.Message.Recalled: // 接收到的消息是撤回的消息
                log.info('接收到的消息是撤回的消息')
                break
            case types.Message.Location: // 接收到的消息是位置
                log.info('接收到的消息是位置')
                break
            case types.Message.GroupNote: // 接收到的消息是群公告
                log.info('接收到的消息是群公告')
                break
            case types.Message.Contact: // 接收到的消息是联系人名片
                log.info('接收到的消息是联系人名片')
                break
            case types.Message.ChatHistory: // 接收到的消息是聊天记录
                log.info('接收到的消息是聊天记录')
                break
            case types.Message.Post: // 接收到的消息是公众号文章
                log.info('接收到的消息是公众号文章')
                break
            case types.Message.Unknown: // 接收到的消息是未知类型
                log.info('接收到的消息是未知类型')
                break
            default:
                break
        }
    }catch(e){
        console.log('处理消息失败...', e)
    }
    // 关键词回复,同时也是发送消息的方法
}

const bot = WechatyBuilder.build({
    name: 'ding-dong-bot',
    puppet: 'wechaty-puppet-xp',
    puppetOptions: {
        version: '3.9.2.23',
    }
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
    .then(async () => {
        log.info('StarterBot', 'Starter Bot Started.')
    })
    .catch(e => log.error('StarterBot', e))

const main = async () => {

    // 获取当前登录微信信息
    try {
        const self = bot.currentUser
        log.info('当前登录账号信息：', self)
    } catch (e) {
        log.error('get user failed', e)
    }

    // 通过微信号搜索联系人
    try {
        const contactById = await bot.Contact.find({
            id: 'filehelper'
        })
        log.info('微信号查找联系人：', contactById)
        // 向联系人发送消息
        contactById?.say('向指定好友微信号发送消息')
    } catch (e) {
        log.error('contactByWeixin', e)
    }

    // 通过昵称搜索联系人
    try {
        const contactByName = await bot.Contact.find({
            name: '文件传输助手'
        })
        log.info('昵称查找联系人：', contactByName)
        // 向联系人发送消息
        contactByName?.say('向指定好友昵称发送消息')
    } catch (e) {
        log.error('contactByName', e)
    }

    // 通过备注搜索联系人
    try {
        const contactByAlias = await bot.Contact.find({
            alias: '超哥'
        })
        log.info('备注名称查找联系人：', contactByAlias || '没有找到联系人')
        // 向联系人发送消息
        contactByAlias?.say('向指定好友备注好友发送消息')
    } catch (e) {
        log.error('contactByAlias', e)
    }

    try {
        // 通过群ID搜索群
        const roomById = await bot.Room.find({
            id: '21341182572@chatroom'
        })
        log.info('群ID查找群：', roomById)
        // 向群里发送消息
        roomById?.say('向指定群ID发送消息')
    } catch (e) {
        log.error('roomById', e)
    }

    try {
        // 通过群名称搜索群
        const roomByName = await bot.Room.find({
            topic: '大师是群主'
        })
        log.info('群名称查找群：', roomByName || '没有找到群')
        // 向群里发送消息
        roomByName?.say('向指定群名称发送消息')
    } catch (e) {
        console.log('roomByName', e)
    }

    try {
        // 获取所有联系人
        const contactList = await bot.Contact.findAll()
        // log.info('获取联系人列表：', contactList)
        log.info('联系人数量：', contactList.length)
    } catch (e) {
        log.error('contactList', e)
    }

    try {
        // 获取所有群
        const roomList = await bot.Room.findAll()
        // log.info('获取群列表：', roomList)
        log.info('群数量：', roomList.length)
    } catch (e) {
        log.error('roomList', e)
    }

}

```

## 版本支持

本项目随wechaty-puppet-xp更新，支持多个微信版本，可自行切换微信版本及对应的npm版本

puppet-xp|微信客户端下载|npm包安装|
|:---|:---|:---|
|1.3.x|[WeChat-v3.9.2.23](https://github.com/tom-snow/wechat-windows-versions/releases/download/v3.9.2.23/WeChatSetup-3.9.2.23.exe)|npm i wechaty-puppet-xp@next|
|1.12.7|[WeChat-v3.6.0.18](https://github.com/tom-snow/wechat-windows-versions/releases/download/v3.6.0.18/WeChatSetup-3.6.0.18.exe)|npm i wechaty-puppet-xp@1.12.7|
|1.11.14|[WeChat-v3.3.0.115](https://github.com/wechaty/wechaty-puppet-xp/releases/download/v0.5/WeChatSetup-v3.3.0.115.exe)|npm i wechaty-puppet-xp@1.11.14|

## 相关项目

- [wechaty-puppet-xp](https://github.com/wechaty/puppet-xp) 项目源码

- [ChatFlow](https://github.com/atorber/chatflow) ChatFlow聊天机器人管理系统

## 参考

- [喜讯：使用Windows微信桌面版协议登录，wechaty免费版协议即将登场, @atorber, Jul 05, 2021](https://wechaty.js.org/2021/07/05/puppet-laozhang-wechat-bot/)
- [全新的Windows puppet项目wechaty-puppet-xp启动, @atorber, Jul 13, 2021](https://wechaty.js.org/2021/07/13/wechaty-puppet-xp-start-up/)
- [code如诗，bot如歌，由Wechaty引发的一个小白冒险之旅, @老张学技术, Jul 05, 2021](https://wechaty.js.org/2021/07/05/code-like-poetry-bot-like-song/)

- [Wechaty Official Website](https://wechaty.js.org/docs/puppet-providers/xp)

 [![Star History Chart](https://api.star-history.com/svg?repos=atorber/puppet-xp-getting-started&type=Date)](https://star-history.com/#atorber/puppet-xp-getting-started&Date)
