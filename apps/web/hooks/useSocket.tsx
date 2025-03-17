import { useState, useEffect } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            setIsLoading(false);
            setSocket(ws);
        };
    }, []);

    return {
        socket,
        isLoading
    }
}