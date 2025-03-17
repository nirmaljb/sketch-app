"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function ChatRoomClient({ data, id }: { data: { message: string }[], id: string }) {
    const [chats, setChats] = useState(data);
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const { socket, isLoading } = useSocket();

    const submitHandler = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        socket?.send(JSON.stringify({ type: 'chat', message: currentMessage, roomid: id }));
        setCurrentMessage("");
    }

    useEffect(() => {
        if(socket && !isLoading) {
            socket.send(JSON.stringify({ type: 'join_room',  roomid: id}));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if(parsedData.type === 'chat') {
                    setChats(c => [...c, parsedData]);
                }
            };
        }

        return () => {
            socket?.close();
        }
    }, [socket, isLoading, id]);

    return <div>
        {chats.map(chat =>  <div key={chat.message}>{chat.message}</div>)}
        <input type="text" value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value) }}/>
        <button type="submit" onClick={submitHandler}>Send</button>
    </div>
}