import ThreadCard from "@/components/cards/ThreadCard";
import Image from "next/image";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import LikesUsers from "@/components/shared/LieksUsers";

const Page = async ({ params }: { params: { id: string } }) => {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(params.id);


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
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    likes={thread.likes}
                />
            </div>
            <div className="flex flex-row">
                <LikesUsers
                    id={user?.id || ''}
                    name={userInfo?.name}
                    username={userInfo?.username}
                    imgUrl={userInfo?.image}
                    likes={thread.likes}
                />
                {/* {thread.likes.map((like:any)=>(
                <div className="text-light-1">
                    
                </div>
            ))} */}
            </div>
        </section>
    )
};

export default Page;