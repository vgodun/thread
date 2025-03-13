import { fetchUserTaggedThreads } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";
import Link from "next/link";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
    name: string;
    username: string;
    imgUrl: string;
}

const TaggedTab = async ({ currentUserId, accountId, accountType, name, username, imgUrl }: Props) => {
    try {
        console.log("TaggedTab: Fetching tagged threads for user:", accountId);
        
        // Fetch threads where the user is tagged
        const taggedThreads = await fetchUserTaggedThreads(accountId);
        
        console.log(`TaggedTab: Found ${taggedThreads.length} tagged threads`);

        if (!taggedThreads || taggedThreads.length === 0) {
            return (
                <div className="mt-10 flex flex-col gap-5">
                    <p className="no-result">No threads found where you are mentioned.</p>
                </div>
            );
        }

        return (
            <section className="mt-9 flex flex-col gap-10">
                <h2 className="text-light-1">Threads where @{username} is mentioned</h2>
                {taggedThreads.map((thread: any) => (
                    <div key={thread._id} className="w-full">
                        <ThreadCard
                            id={thread._id}
                            currentUserId={currentUserId}
                            parentId={thread.parentId}
                            content={thread.text}
                            author={{
                                name: thread.author.name,
                                image: thread.author.image,
                                id: thread.author.id
                            }}
                            createdAt={thread.createdAt}
                            comments={thread.children || []}
                            likes={thread.likes || []}
                            name={name}
                            username={username}
                            imgUrl={imgUrl}
                            imgPosts={thread.imgPosts}
                            isComment={false}
                        />
                        <div className="mt-3 flex gap-3">
                            <Link href={`/thread/${thread._id}`} className="text-primary-500 text-small-semibold hover:underline">
                                View full thread
                            </Link>
                            <p className="text-gray-1">
                                <span className="text-primary-500">@{username}</span> was mentioned in this thread
                            </p>
                        </div>
                    </div>
                ))}
            </section>
        );
    } catch (error) {
        console.error("Error in TaggedTab:", error);
        return (
            <div className="mt-10 flex flex-col gap-5">
                <p className="no-result">Error loading mentioned threads. Please try again later.</p>
            </div>
        );
    }
};

export default TaggedTab;
