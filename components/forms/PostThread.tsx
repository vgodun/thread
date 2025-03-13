"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import Image from "next/image";
import { Input } from "../ui/input";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import MentionAutocomplete from "../shared/MentionAutocomplete";

interface Props {
    userId: string;
}

function PostThread({ userId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [files, setFiles] = useState<File[]>([]);
    const [mentionQuery, setMentionQuery] = useState<string>("");
    const [showMentions, setShowMentions] = useState<boolean>(false);
    const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm<z.infer<typeof ThreadValidation>>({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            imgPosts: "",
            accountId: userId,
        },
    });

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({
            id: userId, // Add the missing 'id' property
            text: values.thread,
            author: userId,
            path: pathname,
            imgPosts: values.imgPosts || '', // Add a check to handle undefined value
        });

        router.push("/");
    };

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

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, fieldChange: (value: string) => void) => {
        const value = e.target.value;
        fieldChange(value);

        // Check for mention
        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const query = mentionMatch[1] || ''; // Use empty string if no characters after @
            setMentionQuery(query);
            setShowMentions(true);

            // Calculate position for autocomplete
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                
                // Get the current selection
                const selectionStart = textarea.selectionStart || 0;
                
                // Create a range to find the position of the @ symbol
                const text = textarea.value;
                const atIndex = text.substring(0, selectionStart).lastIndexOf('@');
                
                if (atIndex !== -1) {
                    // Create a range from the start to the @ symbol
                    const range = document.createRange();
                    const textNode = textarea.firstChild || textarea;
                    
                    // Create a temporary element to measure text position
                    const tempElement = document.createElement('span');
                    tempElement.textContent = text.substring(0, atIndex);
                    tempElement.style.font = window.getComputedStyle(textarea).font;
                    tempElement.style.whiteSpace = 'pre-wrap';
                    tempElement.style.position = 'absolute';
                    tempElement.style.visibility = 'hidden';
                    tempElement.style.width = window.getComputedStyle(textarea).width;
                    document.body.appendChild(tempElement);
                    
                    // Get coordinates
                    const rect = textarea.getBoundingClientRect();
                    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
                    
                    // Calculate position based on text content
                    const textWidth = tempElement.clientWidth % parseInt(window.getComputedStyle(textarea).width);
                    const lines = Math.floor(tempElement.clientWidth / parseInt(window.getComputedStyle(textarea).width));
                    
                    document.body.removeChild(tempElement);
                    
                    // Position the dropdown at the @ symbol, but slightly below
                    setMentionPosition({
                        top: rect.top + window.scrollY + lines * lineHeight + 25, // Add 25px offset to move it below
                        left: rect.left + textWidth + window.scrollX
                    });
                }
            }
        } else {
            setShowMentions(false);
        }
    };

    const handleMentionSelect = (username: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const value = textarea.value;
        const cursorPosition = textarea.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const startPos = cursorPosition - mentionMatch[1].length;
            const newValue = 
                value.substring(0, startPos) + 
                username + 
                value.substring(cursorPosition);
            
            form.setValue('thread', newValue);
            
            // Set cursor position after the inserted username
            setTimeout(() => {
                textarea.focus();
                const newCursorPosition = startPos + username.length;
                textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }

        setShowMentions(false);
    };

    return (
        <Form {...form}>
            <form
                className='mt-10 flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <div className="relative">
                                <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                                    <Textarea 
                                        rows={5} 
                                        {...field} 
                                        placeholder="What's happening? Use @username to tag someone"
                                        ref={textareaRef}
                                        onChange={(e) => handleTextareaChange(e, field.onChange)}
                                    />
                                </FormControl>
                                {showMentions && (
                                    <MentionAutocomplete
                                        query={mentionQuery}
                                        onSelect={handleMentionSelect}
                                        position={mentionPosition}
                                    />
                                )}
                            </div>
                            <p className="text-subtle-medium text-gray-1">
                                Tip: Tag users with @username to notify them
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="imgPosts"
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-4'>
                            <FormLabel className='w-62 h-62 '>
                                {field.value ? (
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={field.value}
                                            alt="profile photo"
                                            width={200}
                                            height={200}
                                            className="object-contain rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-24">
                                        <Image
                                            src="/assets/create.svg"
                                            alt="profile photo"
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                        <p className="text-light-2 ml-2">Add Image</p>
                                    </div>
                                )}
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                <Input
                                    type='file'
                                    accept='image/*'
                                    placeholder='Add profile photo'
                                    className='account-form_image-input'
                                    onChange={(e) => handleImage(e, field.onChange)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type='submit' className='bg-primary-500'>
                    Post Thread
                </Button>
            </form>
        </Form>
    );
}

export default PostThread;