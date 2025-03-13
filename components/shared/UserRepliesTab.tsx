import { getUserReplies } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
    name: any;
    username: any;
    imgUrl: any;
}

const UserRepliesTab = async ({ currentUserId, accountId }: Props) => {
    try {
        const userReplies = await getUserReplies(accountId);

        if (!userReplies || userReplies.length === 0) {
            return (
                <p className="text-light-3 mt-5">No replies yet.</p>
            );
        }

        return (
            <section className="mt-9 flex flex-col gap-10">
                {userReplies.map((reply: any) => {
                    // Make sure we have the parent thread data
                    const parentThread = reply.parentId;
                    if (!parentThread) return null;
                    
                    return (
                        <div key={reply._id} className="w-full">
                            <article className="flex w-full flex-col rounded-xl bg-dark-2 p-7">
                                <div className="flex items-start justify-between">
                                    <div className="flex w-full flex-1 flex-row gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="relative h-11 w-11">
                                                <Image
                                                    src={reply.author.image}
                                                    alt="user_image"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 44px"
                                                    className="cursor-pointer rounded-full"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div className="thread-card_bar" />
                                        </div>

                                        <div className="flex w-full flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="cursor-pointer text-base-semibold text-light-1">
                                                    {reply.author.name}
                                                </span>
                                                <p className="text-subtle-medium text-gray-1">replied to</p>
                                                {parentThread.author && (
                                                    <span className="cursor-pointer text-base-semibold text-light-1">
                                                        {parentThread.author.name}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-2 rounded-xl bg-dark-3 p-4">
                                                <p className="text-small-regular text-light-2">{parentThread.text}</p>
                                                
                                                {/* Display parent post image if it exists */}
                                                {parentThread.imgPosts && (
                                                    <div className="mt-2">
                                                        <Image 
                                                            src={parentThread.imgPosts}
                                                            alt="parent_post_image"
                                                            width={300}
                                                            height={200}
                                                            style={{ height: "auto", width: "auto", maxWidth: "100%" }}
                                                            className="rounded-xl object-cover"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Display parent post likes and comments count */}
                                                <div className="mt-3 flex gap-3.5">
                                                    <div className="flex items-center gap-1">
                                                        <Image
                                                            src="/assets/heart-gray.svg"
                                                            alt="likes"
                                                            width={14}
                                                            height={14}
                                                            style={{ height: "auto" }}
                                                            className="object-contain"
                                                        />
                                                        <p className="text-subtle-medium text-gray-1">
                                                            {parentThread.likes ? parentThread.likes.length : 0}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Image
                                                            src="/assets/reply.svg"
                                                            alt="replies"
                                                            width={14}
                                                            height={14}
                                                            style={{ height: "auto" }}
                                                            className="object-contain"
                                                        />
                                                        <p className="text-subtle-medium text-gray-1">
                                                            {parentThread.children ? parentThread.children.length : 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="mt-4 text-small-regular text-light-2">{reply.text}</p>
                                            
                                            {/* Display reply image if it exists */}
                                            {reply.imgPosts && (
                                                <div className="mt-2">
                                                    <Image 
                                                        src={reply.imgPosts}
                                                        alt="reply_image"
                                                        width={300}
                                                        height={200}
                                                        style={{ height: "auto", width: "auto", maxWidth: "100%" }}
                                                        className="rounded-xl object-cover"
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Display reply likes and comments count */}
                                            <div className="mt-3 flex gap-3.5">
                                                <div className="flex items-center gap-1">
                                                    <Image
                                                        src="/assets/heart-gray.svg"
                                                        alt="likes"
                                                        width={14}
                                                        height={14}
                                                        style={{ height: "auto" }}
                                                        className="object-contain"
                                                    />
                                                    <p className="text-subtle-medium text-gray-1">
                                                        {reply.likes ? reply.likes.length : 0}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Image
                                                        src="/assets/reply.svg"
                                                        alt="replies"
                                                        width={14}
                                                        height={14}
                                                        style={{ height: "auto" }}
                                                        className="object-contain"
                                                    />
                                                    <p className="text-subtle-medium text-gray-1">
                                                        {reply.children ? reply.children.length : 0}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <p className="mt-3 text-subtle-medium text-gray-1">
                                                {formatDateString(reply.createdAt)}
                                            </p>
                                            
                                            <div className="mt-3">
                                                <Link href={`/thread/${parentThread._id}`} className="text-primary-500 text-small-semibold">
                                                    View thread
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    );
                })}
            </section>
        );
    } catch (error) {
        console.error("Error in UserRepliesTab:", error);
        return (
            <p className="text-light-3 mt-5">Failed to load replies. Please try again later.</p>
        );
    }
};

export default UserRepliesTab;
