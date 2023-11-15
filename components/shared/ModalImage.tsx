import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';

const ModalImage = (imgPosts: any) => {

    return (
        <Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
        // <Dialog className='max-w-full bg-white '>
        //     <DialogTrigger className='text-light-1'>
        //         <Image src={imgPosts.imgPosts} alt="post image" width={500} height={500} />
        //     </DialogTrigger>
        //     <DialogContent className='max-w-6xl p-10'>
        //         <DialogHeader>
        //             <Image src={imgPosts.imgPosts} alt="post image" width={1500} height={1500} />
        //         </DialogHeader>
        //     </DialogContent>
        // </Dialog>
    );
};

export default ModalImage;