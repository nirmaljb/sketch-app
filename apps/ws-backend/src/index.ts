import WebSocket from 'ws';
import jwt from "jsonwebtoken"
import 'dotenv/config';
import { IncomingMessage } from "http";

export interface User {
    ws: WebSocket,
    rooms: string[],
    userid: string
};

const user: User[] = []

function checkUser(token: string): string | null {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');

    if(typeof decoded === 'string') {
        return null;
    }

    if(!decoded || !decoded.userid) {
        return null;
    }

    console.log(decoded);
    return decoded.userid;
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

    console.log(token, userid);
    
    if(!userid) {
        ws.close();
        return;
    }
    

    ws.on('message', (message: string) => {
        console.log(`Message received : ${message}`);
        ws.send('pong')
        ws.send(`Server received your message : ${message}`);
    })

    ws.on('close', () => {
        console.log('Client disconnted');
    });
})