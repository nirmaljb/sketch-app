import WebSocket from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken"
import 'dotenv/config';
import { IncomingMessage } from "http";

function checkUser(token: string | null): string | null {
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
            if(typeof decoded == 'string') {
                return null;
            }

            if(!decoded || decoded.userId) {
                return null;
            }

            const userid = decoded.userid;
            return userid
        })
    }
    return null;
}

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('New client connected');

    if(!req.url) {
        return;
    }

    const urlObj = new URL(req.url || '', 'http://localhost:8000/')
    const token = urlObj.searchParams.get('token');
    const userid = checkUser(token);

    console.log(userid);
    
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
    })
})