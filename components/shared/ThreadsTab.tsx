import { fetchUserPosts } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";

interface Props{
    currentUserId: string;
    accountId: string;
    accountType: string;
    name: any;
    username: any;
    imgUrl: any;
}
const ThreadsTab = async ({currentUserId, accountId, accountType,name,username,imgUrl}:Props) => {
    let result= await fetchUserPosts(accountId);

return (
    <section className="mt-9 flex flex-col gap-10">
        {result.threads.map((thread:any) => (
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
             community={
               accountType === "Community"
                 ? { name: result.name, id: result.id, image: result.image }
                 : thread.community
             }
             createdAt={thread.createdAt}
             comments={thread.children}
             likes={thread.likes}
             name={name}
              username={username}
              imgUrl={imgUrl}
           />
        ))}
    </section>
)
};


export default ThreadsTab;