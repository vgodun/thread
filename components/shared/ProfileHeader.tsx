'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ModalAuthorImg from "@/components/shared/ModalAuthorImg";

interface Props {
    accountId: string;
    authUserId: string;
    name: any;
    username: any;
    imgUrl: any;
    bio: string;
    type?: string;
}

function ProfileHeader({
    accountId,
    authUserId,
    name,
    username,
    imgUrl,
    bio,
    type,
}: Props) {

    const path = usePathname();
    return (
        <div className='flex w-full flex-col justify-start'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='relative h-20 w-20 object-cover'>
                        <ModalAuthorImg imgUrl={imgUrl} alt={'logo'} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                        <p className="text-base=medium text-gray-1">@{username}</p>
                    </div>
                </div>
                {accountId === authUserId && (
                    <Link href={`/profile/edit/@${username}`}>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
                            <Image
                                src='/assets/edit.svg'
                                alt='logout'
                                width={16}
                                height={16}
                            />

                            <p className='text-light-2 max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                )}
            </div>

            <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    );
}

export default ProfileHeader;