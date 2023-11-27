import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import LikesUsers from "@/components/shared/LikesUsers";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({params}:{params:{id:string}}) => {
    if(!params.id) return null;

    const user=await currentUser();
    if(!user) return null;

    const userInfo=await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    const thread=await fetchThreadById(params.id);
    
return (
    <section className='relative'>
        <div>
        <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ''}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    likes={thread.likes}
                    name={userInfo?.name}
                    username={userInfo.username}
                    imgUrl={userInfo?.image || ''} 
                    isComment />
        </div>
        <div className="mt-7">
            <Comment 
            threadId={thread.id}
            currentUserImg={userInfo.image}
            currentUserId={JSON.stringify(userInfo._id)}
            likes={thread.likes}
            />
        </div>
        <div className="mt-10">
            {thread.children.map((childrenItem:any)=>(
                 <ThreadCard
                 key={childrenItem._id}
                 id={childrenItem._id}
                 currentUserId={JSON.stringify(childrenItem.id) || ''}
                 parentId={childrenItem.parentId}
                 content={childrenItem.text}
                 author={childrenItem.author}
                 createdAt={childrenItem.createdAt}
                 comments={childrenItem.children}
                 likes={childrenItem.likes}
                 name={userInfo?.name}
                 username={userInfo.username}
                 imgUrl={userInfo?.image || ''}
                 isComment
                 />
            ))}
        </div>
    </section>
)
};

export default Page;