"use client";
import Image from "next/image";
import { likePost } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  threadId: string;
  userId: any;
  likes: any;
  name: any;
  username: any;
  imgUrl: any;
}

export default function LikesPosts({ threadId, userId, likes, name, username, imgUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLikeClick = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent click handlers from firing
    e.stopPropagation();

    try {
      await likePost(threadId, userId, pathname, name, username, imgUrl);
      router.refresh();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const isLiked = likes.some((like: any) => like.id === userId);
  
  return (
    <div onClick={handleLikeClick} className="relative z-20">
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
