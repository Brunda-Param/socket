import express from "express"
const http = require('http');
import { Server } from "socket.io"
import ServerConfig from "./config.json"
import cors from 'cors';

class ServerSocket {
    private socketServer: Server
    private server: any

    constructor() {
        const app = express();
        app.use(cors())
        app.get('/', function (req, res) {
            res.sendFile('/home/divum/param/socket/index.html');
        });
        this.server = http.createServer(app);
        this.socketServer = new Server(this.server, {
            cors: {
                origin: "*"
            }
        });
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socketServer.on('connection', (socket) => {
                console.log("Connected:", socket.id)
                socket.on('join', function (data) {
                    if (!data) {
                        socket.emit("disconnect", { msg: "Invalid Args", status: false })
                        socket.disconnect(true)
                        return;
                    }
                    if (data.smID) {
                        socket.join(data.smID);
                        console.log(`${socket.id}, Joined in ${data.smID}`)
                    }
                    if (data.paramID) {
                        socket.join(data.paramID);
                        console.log(`${socket.id}, Joined in ${data.paramID}`)
                    }
                    if (data.collectionLoc) {
                        socket.join(ServerSocket.getSMGroup(data.collectionLoc)); // We are using room of socket io
                        console.log(`${socket.id}, Joined in ${data.collectionLoc}`)
                    }
                })
                console.log('a user connected');
            });
            this.server.listen(ServerConfig.port, () => {
                console.log(`listening on port:${ServerConfig.port}`);
                return resolve()
            });
        })
    }

    sendDocument(doc: any) {
        // this.socketServer.sockets.in(doc['paramID']).emit(doc['paramID'], doc);
        // this.socketServer.sockets.in(doc['smID']).emit(doc['smID'], doc);
        let smAndstaetTo = ServerSocket.getSMGroup(doc['collectionLoc'], doc['stateTo'])
        this.socketServer.to(doc["paramID"]).emit(doc["paramID"], doc);
        this.socketServer.to(doc["smID"]).emit(doc["smID"], doc);
        this.socketServer.to(smAndstaetTo).emit(smAndstaetTo, doc);
        this.socketServer.sockets.emit(doc["docID"], doc);
    }

    private static getSMGroup(smID: string, stateTo?: string) {
        if (!stateTo) {
            stateTo = ""
        }
        return (smID + "_" + stateTo).toLowerCase()
    }
}

export default ServerSocket