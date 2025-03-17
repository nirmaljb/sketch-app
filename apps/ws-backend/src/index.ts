import WebSocket from 'ws';
import jwt from "jsonwebtoken"
import 'dotenv/config';
import { IncomingMessage } from "http";
import { prisma } from "@repo/db";

export interface User {
    ws: WebSocket,
    rooms: string[],
    userid: string
};

const users: User[] = []

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        
        if(typeof decoded === 'string') {
            return null;
        }
        
        if(!decoded || !decoded.userid) {
            return null;
        }
        
        console.log(decoded);
        return decoded.userid;
    }catch(err) {
        return null;
    }
}

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('New client connected');

    if(!req.url) {
        return;
    }

    const urlObj = new URL(req.url || '', 'http://localhost:8000/')
    const token = urlObj.searchParams.get('token');
    const userid = checkUser(token ?? '');
    
    if(!userid) {
        ws.close();
        return null;
    }

    users.push({
        userid,
        ws,
        rooms: []  
    })
    

    ws.on('message', async (message: string) => {
        try {
            const parsedData = JSON.parse(message);
            if(parsedData.type === 'join_room') {
                const user = users.find(x => x.ws === ws)
                user?.rooms.push(parsedData.roomid);
            }else if(parsedData.type === 'leave_room') {
                const user = users.find(x => x.ws === ws);
                if(!user) {
                    return;
                }
                user.rooms = user?.rooms.filter(x => x !== parsedData.roomid)
            }else if(parsedData.type === 'chat') {
                const roomid = parsedData.roomid;
                const message = parsedData.message;

                try {
                    await prisma.chat.create({
                        data: {
                            roomId: parseInt(roomid),
                            message: message,
                            userId: userid
                        }
                    });
                }catch(err) {
                    console.log('something went wrong: ', err);
                    return;
                }
                
                users.forEach(user => {
                    if(user.rooms.includes(roomid)) {
                        user.ws.send(JSON.stringify({
                            type: "chat",
                            message,
                            roomid
                        }));
                    }
                });
                // ws.send(JSON.stringify(parsedData));
            }
            // console.log(users);
        }catch(err) {
            ws.send('Something is wrong with your input');
        }
    })

    ws.on('close', () => {
        console.log('Client disconnted');
    });
})