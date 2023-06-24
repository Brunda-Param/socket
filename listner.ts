import ServerConfig from "./config.json"
import ServerSocket from './server'
const follow = require('follow');


class MessageDBChangeEvents {
    private static instance: MessageDBChangeEvents
    private server: ServerSocket
    constructor() {

    }
    static getInstance(): MessageDBChangeEvents {
        if (!MessageDBChangeEvents.instance) {
            this.instance = new MessageDBChangeEvents()
        }
        return MessageDBChangeEvents.instance
    }

    listenChanges(): void {
        
        follow({ db: `${ServerConfig.messageDB.URL}/${ServerConfig.messageDB.dbName}`, include_docs: true, since: "now" }, function (error, change) {
            if (error) {
                return error
            }
            MessageDBChangeEvents.getInstance().sendEvents(change)
        })
    }
    sendEvents(change) {
        if (!change || !change.doc) {
            return
        }
        this.server.sendDocument(change.doc)
    }
    startServerSocket(): Promise<void> {
        if (this.server) {
            return Promise.resolve()
        }
        const socketServer: ServerSocket = new ServerSocket()
        return socketServer.connect().then(res => {
            this.server = socketServer
        })
    }
}

export default MessageDBChangeEvents;