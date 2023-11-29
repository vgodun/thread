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
    imgUrl: any;
    // children: React.ReactNode;
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
        <DialogContent>
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
 
{/* <Image
                src={imgPosts}
                alt='heart'
                width={650}
                height={650}
                className='cursor-pointer object-contain'
              /> */}
              {/* </Modal> */}