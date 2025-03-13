'use client';

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Image from 'next/image'
import { usePathname, useRouter } from "next/navigation";
import { deleteThread } from "@/lib/actions/thread.actions";
import { useState } from "react";
import { AlertModal } from "@/components/modal/AlertModal";
import { toast } from "react-hot-toast";

interface Props {
    id: string;
    currentUserId: string;
    authorId: string;
    parentId: string | null;
    isComment: boolean;
}

const ActionsPage = ({ id, currentUserId, authorId, parentId, isComment }: Props) => {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (currentUserId !== authorId) return null;
    
    const onConfirm = async () => {
        try {
            setLoading(true);
            
            console.log(`Deleting thread with ID: ${id}`);
            
            // Call the deleteThread function
            await deleteThread(id, pathname);
            
            // Show success message
            toast.success('Post deleted successfully');
            
            // Navigate to home if it's a main thread (not a comment)
            if (!parentId || !isComment) {
                router.push("/");
            }
            
            // Refresh the current page to update the UI
            router.refresh();
        } catch (error: any) {
            console.error("Error deleting thread:", error);
            toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
        } finally {
            setOpen(false);
            setLoading(false);
        }
    };
    
    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='default' className="h-8 w-8 p-0 text-light-1">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="felx flex-col bg-slate-900 p-4 rounded-xl w-32 ">
                    <DropdownMenuItem
                        className="flex items-center pt-2 pb-2 text-light-1 outline-none cursor-pointer "
                        onClick={() => {
                            if (currentUserId === authorId) return router.push(`/thread/edit/${id}`)
                        }}
                    >
                        <Image
                            src='/assets/edit.svg'
                            alt='logout'
                            width={16}
                            height={16}
                            className="cursor-pointer object-contain mr-2"
                        />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="flex items-center  pt-2 pb-2 text-red-600 outline-none cursor-pointer"
                        onClick={async () => {
                            setOpen(true);
                        }
                        }>

                        <Image
                            src='/assets/delete.svg'
                            alt='delte'
                            width={18}
                            height={18}
                            className='cursor-pointer object-contain mr-2'
                        /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
};

export default ActionsPage;