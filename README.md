## 快速开始

**wechaty-puppet-xp仅支持windows操作系统下使用,微信客户端支持：**

|puppet-xp版本|微信客户端|说明|
|--|--|--|
|v1.12.6+|v3.6.0.18|最新版本的puppet-xp已支持v3.6.0.18版本的微信客户端，还在迭代中，不够稳定，可尝鲜<br>`npm run wechaty-puppet-xp@1.12.6`或`npm run wechaty-puppet-xp@latest`|
|v1.11.14|v3.3.0.115|此版本是目前最稳定的puppet-xp版本，虽然微信版本低，但是稳定使用时建议优先使用<br>`npm run wechaty-puppet-xp@1.11.14`|

### 1. 检查微信客户端并登陆

检查电脑上微信版本是否是支持的版本（如果不是必须下载指定版，如果是则不需要重新安装），正常**登陆微信**

  [WeChatSetup-v3.6.0.18.exe](https://github.com/tom-snow/wechat-windows-versions/releases/tag/v3.6.0.18)

  [WeChatSetup-v3.3.0.115.exe](https://github.com/wechaty/wechaty-puppet-xp/releases/download/v0.5/WeChatSetup-v3.3.0.115.exe)

### 2. 安装并检查当前nodejs环境
[下载安装16LTS版本nodejs](https://nodejs.org/)，检查node版本 >= v16.0.0
```
$ node -v
``` 
### 3. 下载demo代码 [wechaty-puppet-xp-demo](https://github.com/atorber/wechaty-puppet-xp-demo) 

```
$ git clone https://github.com/atorber/wechaty-puppet-xp-demo.git
```

### 4.安装依赖

```
$ cd wechaty-puppet-xp-demo
$ npm install
``` 

### 5. 运行
**尚未支持在程序中扫码登陆，确保微信已处于登录状态**

```
$ npm run start
```

| 运行 | 对应程序 | 说明 |
| :------------- |:-------------| :-----|
| `npm start` | [examples/ding-dong-bot.ts](examples/ding-dong-bot.ts) | ts代码示例 |
| `npm run start:js` | [examples/ding-dong-bot.js](examples/ding-dong-bot.js) | js代码示例 |
| `npm run api` | [examples/api-support-list.ts](examples/api-support-list.ts) | wechaty-api支持检测，可以查看当前版本puppet-xp已经实现的接口 |

## 相关项目

- [wechaty-puppet-xp项目源码](https://github.com/wechaty/puppet-xp)

- [wechat-openai-qa-bot智能问答系统](https://github.com/choogoo/wechat-openai-qa-bot)

## 参考

- [喜讯：使用Windows微信桌面版协议登录，wechaty免费版协议即将登场, @atorber, Jul 05, 2021](https://wechaty.js.org/2021/07/05/puppet-laozhang-wechat-bot/)
- [全新的Windows puppet项目wechaty-puppet-xp启动, @atorber, Jul 13, 2021](https://wechaty.js.org/2021/07/13/wechaty-puppet-xp-start-up/)
- [code如诗，bot如歌，由Wechaty引发的一个小白冒险之旅, @老张学技术, Jul 05, 2021](https://wechaty.js.org/2021/07/05/code-like-poetry-bot-like-song/)

- [Wechaty Official Website](https://wechaty.js.org/docs/puppet-providers/xp)
