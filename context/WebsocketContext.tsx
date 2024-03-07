'use client';
import { subscribe } from "diagnostics_channel";
import React, { createContext, useContext, useEffect, useRef, } from "react";
import { io, Socket } from "socket.io-client";
interface WebsocketContextProps {
    socket: Socket | null;
    emit: ((event: string, data: any) => void) | null;
    subscribe: ((event: string, callback: (data: any) => void) => void) | null;
}
export const WebsocketContext = createContext<WebsocketContextProps>({
    socket: {} as any,
    emit: () => {},
    subscribe: () => {},
})
export function WebsocketProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null);
    useEffect(() => {
        socketRef.current = io(process.env.WEBSOCKET_URL as string);

        socketRef.current.on("connect", () => {
            console.log("Connected to server");
        });

        socketRef.current.on('likes',(likes)=>{
            console.log('likes:',likes);
        })

        return () => {
            if (socketRef.current) {
                socketRef.current.off();
            }
        };
    }, []);

    const emit = (event: string, ...args: any[]) => {
        if (socketRef.current) {
            socketRef.current.emit(event, ...args);
        }
    };
    const subscribe = (event: string, callback: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, (...args: any[]) => callback(...args));
        }
    };
    const contextValue: WebsocketContextProps = {
        socket: socketRef.current,
        emit: emit,
        subscribe: subscribe,
    };
    return (
        <WebsocketContext.Provider value={contextValue}>
            {children}
        </WebsocketContext.Provider>
    );
}

export function useWebsocket() {
    return useContext(WebsocketContext);
}