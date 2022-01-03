const { Vika } = require("@vikadata/vika");

class VikaBot {

    constructor(token) {
        this.vika = new Vika({ token });
        this.spaceId = ''
        this.sysTables = {}
        this.botRecords = {}
        this.secret = {}
        this.reportList = []

    }

    async getAllSpaces() {
        // 获取当前用户的空间站列表
        const spaceListResp = await this.vika.spaces.list()
        if (spaceListResp.success) {
            console.log(spaceListResp.data.spaces);
            return spaceListResp.data.spaces
        } else {
            console.error(spaceListResp);
            return spaceListResp
        }
    }

    async getSpaceId() {
        let spaceList = await this.getAllSpaces()
        for (let i in spaceList) {
            if (spaceList[i].name === 'mp-chatbot') {
                this.spaceId = spaceList[i].id
            }
        }
        return this.spaceId
    }

    async getNodesList() {
        // 获取指定空间站的一级文件目录
        const nodeListResp = await this.vika.nodes.list({ spaceId: this.spaceId })

        if (nodeListResp.success) {
            // console.log(nodeListResp.data.nodes);
            const nodes = nodeListResp.data.nodes
            nodes.forEach(node => {
                // 当节点是文件夹时，可以执行下列代码获取文件夹下的文件信息
                if (node.type === 'Datasheet' && ['group', 'material', 'bot', 'ChatRecord'].indexOf(node.name) != -1) {
                    this.sysTables[node.name] = node.id
                }
            })

        } else {
            console.error(nodeListResp);
        }
        return this.sysTables
    }

    async getRecordsList() {
        const datasheet = this.vika.datasheet(this.sysTables.bot);
        // 分页获取记录，默认返回第一页
        let response = await datasheet.records.query()
        if (response.success) {
            // console.log(response.data.records);
            const records = response.data.records
            const keys = ['contactList', 'lastUpdate', 'timeHms', 'userSelf', 'roomList', 'secret', 'reportList']
            records.forEach(record => {
                // 当节点是文件夹时，可以执行下列代码获取文件夹下的文件信息
                if (keys.indexOf(record.fields.key) != -1) {
                    this.botRecords[record.fields.key] = record.recordId
                    if (record.fields.key === 'secret') {
                        this.secret = JSON.parse(record.fields.value)
                    }
                    if (record.fields.key === 'reportList') {
                        this.reportList = JSON.parse(record.fields.value)
                    }
                }
            })
            keys.forEach(key => {
                if (!this.botRecords[key]) {
                    this.addBotKey(key)
                }
            })
        } else {
            console.error(response);
        }
        return this.botRecords
    }

    async addChatRecord(records) {
        const datasheet = this.vika.datasheet(this.sysTables.ChatRecord);
        datasheet.records.create(records).then(response => {
            if (response.success) {
                console.log(response.code);
            } else {
                console.error(response);
            }
        });
    }

    async addBotKey(key) {
        let records = [{
            "fields": {
                "key": key,
                "value": ""
            }
        },]
        const response = await this.vika.datasheet(this.sysTables.bot)
            .records
            .create(records)

        if (response.success) {
            console.log('创建bot-key成功：', key);
            this.botRecords[key] = response.data.records[0].recordId
        } else {
            console.error(response);
        }

    }

    async updateBot(key, value) {
        const datasheet = this.vika.datasheet(this.sysTables.bot);
        datasheet.records.update([
            {
                "recordId": this.botRecords[key],
                "fields": {
                    "key": key,
                    "value": value
                }
            }]).then(response => {
                if (response.success) {
                    console.log(key, ':', response.code);
                } else {
                    console.error(response);
                }
            });
    }

    async getSecret() {

        return this.secret
    }
    async checkInit() {
        this.spaceId = await this.getSpaceId()
        console.debug('mp-chatbot空间ID:', this.spaceId)

        if (this.spaceId) {
            this.sysTables = await this.getNodesList()
            console.debug('sysTables初始化表:', this.sysTables)
        } else {
            console.debug('mp-chatbot空间不存在')
        }
        if (Object.keys(this.sysTables).length == 4) {
            let RecordsList = await this.getRecordsList()
            console.debug('bot表:', RecordsList)
            if (this.secret) {
                console.debug(this.secret)
                console.debug('配置检查通过')
            } else {
                console.debug('secret未配置')
            }
        } else {
            console.debug('缺失必须的表！！！！！！', Object.keys(this.sysTables))
        }

        return { secret: this.secret, reportList: this.reportList }
    }

}





module.exports = {
    VikaBot
}