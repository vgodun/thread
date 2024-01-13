'use client';
import {
    Dialog,
    DialogTrigger,
    DialogPost
} from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
    imgUrl: string;
}

const ModalPost = ({ imgUrl }: Props) => {
    return (

        <Dialog>
            <DialogTrigger>
                <Image
                    src={imgUrl}
                    alt="img_posts"
                    width={850}
                    height={850}
                    className="w-full h-full"
                />
            </DialogTrigger>
            <DialogPost className=" h-96 w-96 gap-4 bg-white border p-7 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950 max-w-full w-6/12 ">
                <Image
                    src={imgUrl}
                    alt="img_posts"
                    width={650}
                    height={650}
                    className="w-full h-full"
                />
            </DialogPost>
        </Dialog>
    )
}


export default ModalPost;
