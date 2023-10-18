import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    // fetch organization list created by user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");
    const userId=userInfo._id.toString();
    return (
        <>
            <h1 className='head-text'>Create Thread</h1>
            <PostThread userId={userId} />
        </>
    );
}

export default Page;