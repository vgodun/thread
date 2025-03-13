import { fetchUserPosts } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";
import Link from "next/link";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
    name: any;
    username: any;
    imgUrl: any;
}

const UserThreadsTab = async ({ currentUserId, accountId, accountType, name, username, imgUrl }: Props) => {
    let result = await fetchUserPosts(accountId);

    if (!result || !result.threads || result.threads.length === 0) {
        return (
            <p className="text-light-3 mt-5">No threads found.</p>
        );
    }

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread: any) => (
                <div key={thread._id} className="w-full">
                    <ThreadCard
                        id={thread._id}
                        currentUserId={currentUserId}
                        parentId={thread.parentId}
                        content={thread.text}
                        author={
                            accountType === "User"
                                ? { name: result.name, image: result.image, id: result.id }
                                : {
                                    name: thread.author.name,
                                    image: thread.author.image,
                                    id: thread.author.id,
                                }
                        }
                        createdAt={thread.createdAt}
                        comments={thread.children}
                        likes={thread.likes}
                        name={name}
                        username={username}
                        imgUrl={imgUrl}
                        imgPosts={thread.imgPosts}
                        isComment={false}
                    />
                    <div className="mt-3">
                        <Link href={`/thread/${thread._id}`} className="text-primary-500 text-small-semibold">
                            View full thread
                        </Link>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default UserThreadsTab;
