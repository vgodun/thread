import Image from "next/image";
import Link from "next/link";
import LikesPosts from "../shared/LikesPosts";
import ActionsPage from "@/app/(root)/thread/components/action";
import ModalPost from "../shared/ModalPost";
import { likePost } from "@/lib/actions/thread.actions";
import { formatDateString } from "@/lib/utils";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment: boolean;
  likes: any;
  name?: any;
  username?: any;
  imgUrl?: any;
  imgPosts?: string;
}

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  createdAt,
  comments,
  isComment,
  likes,
  name,
  username,
  imgUrl,
  imgPosts
}: Props) {
  return (

    <article
      className={`flex w-full flex-col rounded-xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
        }`}
    >

      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>
            <div className='thread-card_bar' />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>
            <p className='mt-2 text-small-regular text-light-2'>{content}</p>
            {imgPosts && (
              <ModalPost imgUrl={imgPosts} />
            )}

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className='flex gap-3.5'>
                <LikesPosts
                  threadId={id}
                  userId={currentUserId}
                  likes={likes}
                  name={name}
                  username={username}
                  imgUrl={imgUrl}
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src='/assets/reply.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </Link>
                <Link href={`/replies/${id}`}>
                  <Image
                    src='/assets/repost.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </Link>
                <Image
                  src='/assets/share.svg'
                  alt='heart'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain'
                />
              </div>
              <div className="flex gap-3.5 justify-center item">
              </div>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className=" flex pl-2">
            <ActionsPage
              id={id}
              currentUserId={currentUserId}
              authorId={author.id}
              parentId={parentId}
              isComment={isComment} 
              />
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center">
        {isComment && (
          <div className='ml-1 mt-3 flex flex-row items-center gap-2'>

            {comments.slice(0, 2).map((comment, index) => (
              <Image
                key={index}
                src={comment.author.image}
                alt={`user_${index}`}
                width={24}
                height={24}
                className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
              />
            ))}
          </div>
        )}
        {
          <Link href={`/thread/${id}`} className="mt-3 px-3">
            {comments.length === 0 ? null : (
              <p className='mt-1 text-subtle-medium text-gray-1'>
                {comments.length} repl{comments.length > 1 ? "ies" : "y"}
              </p>
            )}
          </Link>
        }
        {
          <Link href={`/likesUsers/${id}`} className="mt-3">
            {likes.length === 0 ? null : (
              <p className="mt-1 text-subtle-medium text-gray-1">
                {likes.length} lik{likes.length > 1 ? "es" : "e"}
              </p>
            )}
          </Link>
        }

      </div>

      <div className="py-3">
        <p className='text-subtle-medium text-gray-1'>
          {formatDateString(createdAt)}
        </p>
      </div>
    </article>
  );
}

export default ThreadCard;