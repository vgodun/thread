'use client'
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
    name: string;
    username: string;
    imgUrl: string;
    id: string;
    likes: any
}

export default function LikesUsers({ name, username, imgUrl, id, likes }: Props) {
    const router = useRouter();
    return (
        <article className="user-card">
            <div className="flex flex-col">
            {likes.map((like: any) => (
                    <p className="text-light-1 block">{like}</p>
            ))
            }
            </div>
            

            <div className="user-card_avatar">
                <Image
                    src={imgUrl}
                    alt="logo"
                    width={48}
                    height={48}
                    className="rounded-full"
                />
                <div className="flex-1 text-ellipsis">
                    <h4 className="text-base-semibold text-light-1">{name}</h4>
                    <p className="text-small-medium text-gray-1">@{username}</p>
                </div>
            </div>
            <Button className="user-card_btn" onClick={() => {
                router.push(`/profile/${id}`);
            }}>
                View
            </Button>
        </article >
        // <div>
        //      <Image
        //             src={imgUrl}
        //             alt={name}
        //             width={40}
        //             height={40}
        //             className="rounded-full" />
        //     <div className="flex flex-row ">

        //         <div className="flex flex-col">
        //             <p className="text-light-1 pb-1">{name}</p>
        //             <p className="text-gray-1">@{username}</p>
        //         </div>
        //         <Button className="user-card_btn" onClick={() => {
        //             router.push(`/profile/${id}`);
        //         }}>
        //             View
        //         </Button>
        //     </div>
        // </div>
    )
}

