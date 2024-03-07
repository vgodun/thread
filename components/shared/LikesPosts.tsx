"use client";
import Image from "next/image";
import { likePost } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useWebsocket } from "@/context/WebsocketContext";

interface Props {
  threadId: string;
  userId: any;
  likes: string[];
  name: any;
  username: any;
  imgUrl: any;
}

export default function LikesPosts({ threadId, userId, likes, name, username, imgUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { emit, subscribe } = useWebsocket();

  useEffect(() => {
    subscribe && subscribe('likes', (receivedLikes: any) => {
      console.log('Likes updated:', receivedLikes);
      
      if(receivedLikes.threadId === threadId) {
        router.refresh();
      }
    });
  }, [subscribe]);

  const handleLikeClick = async () => {
    await likePost(threadId, userId, pathname, name, username, imgUrl);
    
   emit && emit('likes', {threadId, userId, name, username, imgUrl}); // Передати дані серверу);
    
    router.refresh();
  };

  const isLiked = likes.some((like: any) => like.id === userId);

  return (
    <div onClick={handleLikeClick}>
      <Image
        src={isLiked ? "/assets/heart-red.svg" : "/assets/heart-gray.svg"}
        alt="heart"
        width={24}
        height={24}
        className="cursor-pointer"
      />
    </div>
  );
}