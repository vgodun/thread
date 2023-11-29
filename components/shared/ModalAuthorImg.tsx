'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
    imgUrl: string;
    alt: string;
}

const ModalAuthorImg = ({ imgUrl, alt }: Props) => {
    return (

        <Dialog>
            <DialogTrigger className="rounded-full object-cover shadow-2xl">
                <Image
                    src={imgUrl}
                    alt={alt}
                    fill
                    className='rounded-full object-cover shadow-2xl'
                />
            </DialogTrigger>
            <DialogContent className="rounded-full object-cover shadow-2xl">
                <Image
                    src={imgUrl}
                    alt={alt}
                    width={500}
                    height={500}
                    className='rounded-full object-cover shadow-2xl'
                />
            </DialogContent>
        </Dialog>
    )
}

export default ModalAuthorImg;
