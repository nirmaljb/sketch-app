import express from "express";
import jwt from "jsonwebtoken";
import WebSocket from "ws"
import { tokenValidation } from "./middlware/token";
import { prisma } from "@repo/db";
import 'dotenv/config';
import { RequestCustom } from "../types/express";
import { CreateUserSchema, LoginUserSchema, RoomSchema } from "@repo/common/types";
import { hash, compare } from "bcrypt-ts";

const app = express();
app.use(express.json())

app.get('/', async (req, res) => {
    const user = await prisma.user.findMany({});
    if(!user) {
        res.json({message: 'Empty database'})
        return;
    }
    res.json({message: 'Backend is running', user});
});

app.post('/signup', async (req, res) => {
    
    const zodValidation = CreateUserSchema.safeParse(req.body);
    
    if(!zodValidation.success) {
        res.status(422).json({ message: 'Invalid inputs', error: zodValidation.error });
        return;
    }
    
    const { username, email, password } = zodValidation.data;

    try {
        const hashedPassword = await hash(password, 10);
        const response = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true
            }
        });

        const token = jwt.sign({
            userid: response.id,
            sub: username
        }, process.env.JWT_SECRET || '');

        res.json({ token: token, response: response } );
        return;
    }catch(err) {
        res.status(500).json({ message: 'There might an already existing user with this credentials', error: err });
    }

    res.status(500).json({ message: 'Something went wrong, try again' });
});

app.post('/signin', async (req, res) => {
    // const { username, password } = req.body;

    const zodValidation = LoginUserSchema.safeParse(req.body);

    if(!zodValidation.success) {
        res.status(422).json({ message: 'Invalid inputs', error: zodValidation.error });
        return;
    }

    const { username, password } = zodValidation.data;

    try {
        const doesUserExists = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(!doesUserExists) {
            res.json({ message: 'No user exists with such username' });
            return;
        }

        const doesPasswordMatch = await compare(password, doesUserExists.password);

        if(!doesPasswordMatch) {
            res.json({ message: 'Password does not match' });
            return;
        }

        const token = jwt.sign({
            userid: doesUserExists.id,
            sub: username,
        }, process.env.JWT_SECRET || '');

        res.json({ doesUserExists, token });
        return;
    }catch(err) {
        res.status(500).json({ message: 'Something went wrong while interacting with the DB', error: err });
    }
    res.status(500).json({ message: 'Something went wrong, try again' });
});

app.post('/create-room', tokenValidation, async (req: RequestCustom, res) => {
    const token = req.headers['authorization'];
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

    const zodValidation = RoomSchema.safeParse(req.body);
    if(!zodValidation.success) {
        res.status(422).json({ message: 'Invalid inputs', error: zodValidation.error });
        return;
    }
    const userid = req.userid ?? '';
    console.log(userid);
    const { name } = zodValidation.data;

    try {
        const response = await prisma.room.create({
            data: {
                slug: name,
                adminId: userid
            }
        });

        ws.on('connection', () => {
            ws.send(JSON.stringify({message: response}));
        });

        res.json({ roomId: response.id });
        return;
    }catch(err) {
        if(ws.CLOSED) {
            res.json({ message: 'Served closed on you' });
            return;
        }
        res.status(500).json({ message: 'Most probably a room already exists with this name', error: err })
    }

    res.status(500).json({ message: 'Something went wrong, try again' });
});

app.get('/chats/:roomid', async (req, res) => {
    const { roomid } = req.params;
    // res.json(roomid);
        try {
            const response = await prisma.chat.findMany({
                where: {
                    roomId: parseInt(roomid)
                },
                orderBy: {
                    id: 'desc'
                },
                take: 50
            })

            res.json(response);
        }catch(err) {
            res.json({ message: 'Something went wrong with prisma', error: err });
        }

        res.status(500).json({ message: 'Something went from'});
});

app.listen(8000, () => {
    console.log(`Listening to http://localhost:8000`);
})