"use client";

import { useEffect } from 'react'
import Image from "next/image";
import { likePost } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";
import {io,Socket} from 'socket.io-client'


interface Props {
  threadId: string;
  userId: any;
  likes: string[];
  name: any;
  username: any;
  imgUrl: any;
}

export default function LikesPosts({ threadId, userId, likes, name, username, imgUrl }: Props) {
  const route = useRouter();
  const pathname = usePathname();
  useEffect(()=>{
const socket=io('http://localhost:9000');
    console.log('useEffect');
    socket.on('connect',()=>{
      console.log('Connected!')
    })
    console.log('listening Websocket');

    socket.on('likes',(likes)=>{
      console.log('likes',likes)
    });

    return ()=>{
      socket.off('off')
    }
  },[])
  const handleLikeClick = async () => {
    await likePost(threadId, userId, likes, pathname, name, username, imgUrl);
    route.refresh();
  };
  const isLiked = likes.some((like: any) => like.id === userId);
  return (
    <div onClick={handleLikeClick}>
      <Image
        src={isLiked ? "/assets/heart-red.svg" : "/assets/heart-gray.svg"}
        alt="heart"
        width={24}
        height={24}
        className="cursor-pointer "
      />
    </div>
  );
}
