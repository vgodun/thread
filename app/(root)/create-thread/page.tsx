import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPosts } from "@/lib/actions/thread.actions";

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    // fetch organization list created by user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");
    const userId = userInfo._id.toString();
    const result = await fetchPosts(1, 30);
    
    
    
    return (
        <>
            <h1 className='head-text'>Create Thread</h1>
            <PostThread userId={userId} posts={result.posts[0].imgPosts}/>
        </>
    );
}

export default Page;