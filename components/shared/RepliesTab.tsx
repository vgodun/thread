import { fetchUserPosts } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
    name: any;
    username: any;
    imgUrl: any;
}
const RepliesTab = async ({ currentUserId, accountId, accountType, name, username, imgUrl }: Props) => {
    let result = await fetchUserPosts(accountId);

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread: any) => (
                <>
                    <ThreadCard
                        key={thread._id}
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
                        isComment
                    />
                </>
            ))}
        </section>
    )
};


export default RepliesTab;