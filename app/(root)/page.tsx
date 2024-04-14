import { currentUser } from "@clerk/nextjs";

import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";

import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";

async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    const user = await currentUser();

    const userInfo = await fetchUser(user?.id || '');

    const result = await fetchPosts(
        searchParams.page ? +searchParams.page : 1,
        30
    );
    return (
        <>
            <h1 className='head-text text-left'>Home</h1>

            <section className='mt-9 flex flex-col gap-10'>
                {result.posts.length === 0 ? (
                    <p className='no-result'>No threads found</p>
                ) : (
                    <>
                        {result.posts.map((post: any) => (
                            <ThreadCard
                                key={post._id}
                                id={post._id}
                                currentUserId={user?.id || ''}
                                parentId={post.parentId}
                                content={post.text}
                                author={post.author}
                                createdAt={post.createdAt}
                                comments={post.children}
                                likes={post.likes}
                                name={userInfo?.name}
                                username={userInfo?.username}
                                imgUrl={userInfo?.image}
                                imgPosts={post.imgPosts}
                                isComment
                            />
                        ))}
                    </>
                )}
            </section>
            <Pagination
                path='/'
                pageNumber={searchParams?.page ? +searchParams.page : 1}
                isNext={result.isNext}
            />
        </>
    );
}

export default Home;