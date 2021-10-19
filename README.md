## 快速开始
### 0. 下载微信客户端并登陆
下载 [WeChatSetup-v3.3.0.115](https://github.com/wechaty/wechaty-puppet-xp/releases/download/v0.5/WeChatSetup-v3.3.0.115.exe) 版本的PC微信客户端并登陆微信

### 1. 检查当前node环境
[安装16LTS版本nodejs](https://nodejs.org/)

```
$ node --version // >= v16.0.0
``` 
### 2. 下载demo代码 [wechaty-puppet-xp-demo](https://github.com/xp/wechaty-puppet-xp-demo) .

```
$ git clone https://github.com/atorber/wechaty-puppet-xp-demo.git
```

安装依赖.

```
$ cd wechaty-puppet-xp-demo
$ npm install
``` 

### 3. 运行

```
$ npm run start
```

## PUPPET COMPARISON

XP is a young puppet,it keeps growing and improving.

Puppet|xp👍
:---|:---:
支持账号|个人微信
**<消息>**|
收发文本|✅|
发送图片、文件|✅
接收图片、文件|✅
接收动图|✅
发送动图|✅（以文件形式发送）
转发文本|✅
转发图片|✅
**<群组>**|
@群成员|✅
群列表|✅
群成员列表|✅
群详情|✅
**<联系人>**|
好友列表|✅
好友详情|✅
**<其他>**|
登录事件|✅
依赖协议|Windows

## Blogs

- [喜讯：使用Windows微信桌面版协议登录，wechaty免费版协议即将登场, @atorber, Jul 05, 2021](https://wechaty.js.org/2021/07/05/puppet-laozhang-wechat-bot/)
- [全新的Windows puppet项目wechaty-puppet-xp启动, @atorber, Jul 13, 2021](https://wechaty.js.org/2021/07/13/wechaty-puppet-xp-start-up/)
- [code如诗，bot如歌，由Wechaty引发的一个小白冒险之旅, @老张学技术, Jul 05, 2021](https://wechaty.js.org/2021/07/05/code-like-poetry-bot-like-song/)

Official website<https://wechaty.js.org/docs/puppet-providers/xp>
