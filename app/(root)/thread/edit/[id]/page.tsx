import AccountProfile from "@/components/forms/AccountProfile";
import { redirect } from "next/navigation";
import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPosts, fetchThreadById } from "@/lib/actions/thread.actions";
import ThreadEdit from "@/components/forms/ThreadEdit";


export default async function page({params}:{params:{id:string}}){
    const user = await currentUser();
    if (!user) return null; // to avoid typescript warnings


    const userInfo = await fetchUser(user.id);
    // if (userInfo?.onboarded) redirect("/");
    const thread=await fetchThreadById(params.id);



    const userData={
       id:thread.id,
       text:thread.text,
       imgPosts:thread.imgPosts,
    }
    
    return (
        <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
            <h1 className='head-text'>Edit</h1>
            <p className='mt-3 text-base-regular text-light-2'>Complete your profile not to use Threads</p>

            <section className='mt-9 bg-dark-2 p-10'>
                <ThreadEdit thread={userData} btnTitle="Continue"/>
            </section>
        </main>
    )
}