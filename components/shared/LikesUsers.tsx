'use client';
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
    id: string;
    likes: any;
}

export default function LikesUsers({ id, likes }: Props) {
    const router = useRouter();
    return (
        <article className="user-card w-full">
            <div className="flex w-full flex-col">
                {likes.map((like: any) => (
                    <div key={like.id} className="flex w-full flex-col rounded-xl bg-dark-2 p-7 my-3">
                        <div className="user-card_avatar">
                            <Image
                                src={like?.image}
                                alt="logo"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <div className="flex-1 text-ellipsis w-full">
                                <h4 className="text-base-semibold text-light-1">{like?.name}</h4>
                                <p className="text-small-medium text-gray-1">@{like?.username}</p>
                            </div>
                            <Button className="user-card_btn" onClick={() => {
                                router.push(`/profile/${like.id}`);
                            }}>
                                View
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
