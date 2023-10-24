import Link from "next/link";
import Image from 'next/image';
import LikesPosts from "../shared/LikesPosts";

interface Props {
    id: string;
    currentUserId: any;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    };
    community: {
        id: string;
        name: string;
        image: string;
    } | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
            name: string;
        };
    }[];
    isComment?: boolean;
    likes: string[];
}
const ThreadCard = ({ id, currentUserId, parentId, content, author, community, createdAt, comments, isComment, likes }: Props) => {
    return (
        <article className={`flex w-full flex-col rounded-xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"}`}>
            <div className='flex items-center justify-between'>

                <div className='flex w-full flex-1 flex-row gap-4 mb-10'>
                    <div className='flex flex-col items-center'>
                        <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
                            <Image
                                src={author.image}
                                alt='Profile image'
                                fill
                                className='cursor-pointer rounded-full'
                            />
                        </Link>
                        <div className='thread-card_bar' />
                        <div className="flex flex-row flex-wrap w-10 justify-center">
                            {comments.slice(0, 3).map((commentUsers, index) => (
                                <div key={index} className="flex flex-row  ">
                                    <Image
                                        src={commentUsers.author.image}
                                        alt='Profile image'
                                        width={20}
                                        height={20}
                                        className='cursor-pointer rounded-full '
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex w-full flex-col'>
                        <Link href={`/profile/${author.id}`} className='w-fit'>
                            <h4 className='cursor-pointer text-base-semibold text-light-1'>{author.name}</h4>
                        </Link>
                        <p className='mt-2 text-small-regular text-light-2'>{content}</p>
                        <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
                            <div className='flex gap-3.5'>
                                <LikesPosts threadId={id} userId={currentUserId} likes={likes} />
                                <Link href={`/thread/${id}`}>
                                    <Image
                                        src='/assets/reply.svg'
                                        alt='reply'
                                        width={24}
                                        height={24}
                                        className='cursor-pointer object-contain'
                                    />
                                </Link>
                                <Image
                                    src='/assets/repost.svg'
                                    alt='repost'
                                    width={24}
                                    height={24}
                                    className='cursor-pointer object-contain'
                                />
                                <Image
                                    src='/assets/share.svg'
                                    alt='share'
                                    width={24}
                                    height={24}
                                    className='cursor-pointer object-contain'
                                />
                            </div>
                            {/* {
                            isComment && comments.length > 0 && (
                                <div className="flex flex-row">
                                    <Link href={`/thread/${id}`}>
                                    <p className='mt-1 text-subtle-medium text-gray-1 w-20'>{comments.length} replies</p>
                                </Link>
                                <p className="mt-1 text-subtle-medium text-gray-1">{likes.length} likes</p>
                                </div>
                            )
                        } */}
                            <div className="flex flex-row">
                                {isComment && comments.length > 0 && (
                                    <div className="likes-container">
                                        {/* <p className="mt-1 text-subtle-medium text-gray-1 w-20">{likes.length} likes</p> */}
                                        <p className="mt-1 text-subtle-medium text-gray-1 w-20 ">{comments.length} replies</p>
                                    </div>
                                )}
                                {isComment && likes.length > 0 && (
                                    <p className="mt-1 text-subtle-medium text-gray-1">{likes.length} likes</p>
                                )}
                                {!isComment && comments.length && (
                                    <div className="likes-container pl-2.5">
                                        <Link href={`/thread/${id}`}>
                                        <p className="mt-1 text-subtle-medium text-gray-1 w-20">{comments.length} replies</p>
                                        </Link>
                                    </div>
                                )}
                                {!isComment && likes.length && (
                                    <div className="likes-container">
                                        <p className="mt-1 text-subtle-medium text-gray-1">{likes.length} likes</p>
                                    </div>
                                )}


                                {/* <Link href={`/thread/${id}`}>
                                    <p className="mt-1 text-subtle-medium text-gray-1 w-20">{comments.length} replies</p>
                                </Link> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
};

export default ThreadCard;