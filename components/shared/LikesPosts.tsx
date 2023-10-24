'use client'
import Image from "next/image";
import { likePost } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  threadId: string;
  userId: any;
  likes: string[];
}

export default function LikesPosts({ threadId, userId, likes }: Props) {
   const route=useRouter();
  const pathname=usePathname();
    const handleLikeClick = async () => {
    await likePost(threadId, userId, likes,pathname);
    route.refresh(); 
    }
    
    const isLiked = likes.includes(userId);
  return (
    <div onClick={handleLikeClick} >
        <Image
        src={isLiked ?'/assets/heart-red.svg':'/assets/heart-gray.svg'}
        alt='heart'
        width={24}
        height={24}
        className='cursor-pointer '
        />
    </div>
  )
}
