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
    imgUrl: any;
}

const Modal = ({imgUrl}:Props) => {
    return(
        
        <Dialog>
        <DialogTrigger>
        <Image 
            src={imgUrl}
            alt="img_posts"
            width={350}
            height={350}
            />
            </DialogTrigger>
        <DialogContent className="gap-4 border border-slate-200 bg-white p-7 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950">
           <Image 
            src={imgUrl}
            alt="img_posts"
            width={650}
            height={650}
            className="w-full h-full"
            />
        </DialogContent>
      </Dialog>
    )
}


export default Modal;
