'use client';

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import * as z from 'zod';
import React, { ChangeEvent, useState } from "react";
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from '@/lib/uploadthing';
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { deleteImgPosts, updateThread } from "@/lib/actions/thread.actions";
import { ThreadEdits } from "@/lib/validations/thread";

interface Props {
    thread: {
        id: string;
        text: string;
        imgPosts?: string;
    },
    btnTitle: string;
}
const ThreadEdit = ({ thread, btnTitle }: Props) => {
    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing('media');
    const router = useRouter();
    const pathname = usePathname();
    const form = useForm({
        resolver: zodResolver(ThreadEdits),
        defaultValues: {
            text: thread?.text || '',
            imgPosts: thread?.imgPosts || '',
        }
    });

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();
        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));
            if (!file.type.includes('image')) return;
            fileReader.onload = async (e) => {
                const imageDataUrl = e.target?.result?.toString() || '';
                fieldChange(imageDataUrl);
            }
            fileReader.readAsDataURL(file);
        }
    }
    const deleteImage = async () => {
        if (thread.id && thread.imgPosts) {
            await deleteImgPosts(thread.id, thread.imgPosts || '');
            form.setValue('imgPosts', '');
          }
    }
    const onSubmit = async (values: z.infer<typeof ThreadEdits>) => {


        await updateThread({
            id: thread?.id,
            text: values.text,
            imgPosts: values.imgPosts || '',
            path: pathname,
            author: '', // Add the missing "author" property
        });
        if (pathname === `/thread/edit/`) {
            router.back();
        }
        else {
            router.push(`/`);
            router.refresh();
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
                {thread.imgPosts ? (
                    <FormField
                        control={form.control}
                        name="imgPosts"
                        render={({ field }) => (
                            <FormItem className='flex items-center gap-4'>
                                <FormLabel className='account-form_image-label'>
                                    {field.value ? (
                                        <Image
                                            src={field.value}
                                            alt='profile photo'
                                            width={650}
                                            height={650}
                                            priority
                                            className='rounded-full object-contain'
                                        />
                                    ) : <Image
                                    src='/assets/profile.svg'
                                    alt='profile photo'
                                    width={96}
                                    height={96}
                                    priority
                                    className='rounded-full object-contain'
                                />}
                                </FormLabel>
                                <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                    <Input
                                        type='file'
                                        accept='image/*'
                                        placeholder='Upload a photo'
                                        className='account-form_image-input'
                                        onChange={(e) => handleImage(e, field.onChange)}
                                    />
                                </FormControl>
                                <Image
                                    src='/assets/delete.svg'
                                    alt='delte'
                                    width={18}
                                    height={18}
                                    className='cursor-pointer object-contain'
                                    onClick={deleteImage}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ):(
                    <FormField
                        control={form.control}
                        name="imgPosts"
                        render={({ field }) => (
                            <FormItem className='flex items-center gap-4'>
                                <FormLabel className='account-form_image-label'>
                                    {field.value ? (
                                        <Image
                                            src={field.value}
                                            alt='profile photo'
                                            width={650}
                                            height={650}
                                            priority
                                            className='rounded-full object-contain'
                                        />
                                    ) : <Image
                                    src='/assets/profile.svg'
                                    alt='profile photo'
                                    width={96}
                                    height={96}
                                    priority
                                    className='rounded-full object-contain'
                                />}
                                </FormLabel>
                                <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                    <Input
                                        type='file'
                                        accept='image/*'
                                        placeholder='Upload a photo'
                                        className='account-form_image-input'
                                        onChange={(e) => handleImage(e, field.onChange)}
                                    />
                                </FormControl>
                                <Image
                                    src='/assets/delete.svg'
                                    alt='delte'
                                    width={18}
                                    height={18}
                                    className='cursor-pointer object-contain'
                                    onClick={deleteImage}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <FormControl>
                                <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                                    <Textarea rows={5} {...field} />
                                </FormControl>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='bg-primary-500'>Submit</Button>
            </form>
        </Form>
    )
};

export default ThreadEdit;