"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";

import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import { useState, useRef } from "react";
import MentionAutocomplete from "../shared/MentionAutocomplete";
import { EVENTS, useRealtime } from "../providers/PusherProvider";
import { toast } from "react-hot-toast";

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
    likes: string[];
}
const Comment = ({ threadId, currentUserImg, currentUserId, likes }: Props) => {
    const pathname = usePathname();
    const [mentionQuery, setMentionQuery] = useState<string>("");
    const [showMentions, setShowMentions] = useState<boolean>(false);
    const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { publishEvent } = useRealtime();

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: "",
        },
    });

    // Function to trigger real-time updates for comments
    const triggerRealTimeCommentUpdate = async (comment: any) => {
        try {
            const channelName = `thread-comments-${threadId}`;
            
            await publishEvent(channelName, EVENTS.COMMENT_ADDED, {
                threadId,
                comment,
                authorId: currentUserId
            });
        } catch (error) {
            console.error("Error triggering real-time comment update:", error);
        }
    };

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        try {
            setIsSubmitting(true);
            console.log(`Submitting comment for thread: ${threadId}, user: ${currentUserId}`);
            
            // Don't parse the userId, use it directly
            const comment = await addCommentToThread({
                threadId,
                commentText: values.thread,
                userId: currentUserId,
                path: pathname,
                imgPosts: "" // Add empty string for imgPosts parameter
            });

            // If comment was successfully added, trigger real-time update
            if (comment) {
                // Create a simplified comment object for real-time updates
                const commentForRealtime = {
                    id: comment._id.toString(),
                    content: values.thread,
                    author: {
                        id: currentUserId,
                        name: comment.author.name,
                        image: currentUserImg
                    },
                    createdAt: new Date().toISOString()
                };
                
                // Trigger real-time update
                await triggerRealTimeCommentUpdate(commentForRealtime);
            }

            form.reset();
            toast.success("Comment added!");
        } catch (error) {
            console.error("Error submitting comment:", error);
            toast.error("Failed to add comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
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
            if (inputRef.current) {
                const input = inputRef.current;
                
                // Get the current selection
                const selectionStart = input.selectionStart || 0;
                
                // Find the position of the @ symbol
                const text = input.value;
                const atIndex = text.substring(0, selectionStart).lastIndexOf('@');
                
                if (atIndex !== -1) {
                    // Get input coordinates
                    const rect = input.getBoundingClientRect();
                    
                    // Create a temporary element to measure text width
                    const tempElement = document.createElement('span');
                    tempElement.textContent = text.substring(0, atIndex);
                    tempElement.style.font = window.getComputedStyle(input).font;
                    tempElement.style.position = 'absolute';
                    tempElement.style.visibility = 'hidden';
                    document.body.appendChild(tempElement);
                    
                    // Calculate position
                    const atPosition = tempElement.getBoundingClientRect().width;
                    
                    document.body.removeChild(tempElement);
                    
                    // Position the dropdown at the @ symbol, but slightly below
                    setMentionPosition({
                        top: rect.bottom + window.scrollY + 10, // Add 10px offset to move it below
                        left: rect.left + atPosition + window.scrollX
                    });
                }
            }
        } else {
            setShowMentions(false);
        }
    };

    const handleMentionSelect = (username: string) => {
        const input = inputRef.current;
        if (!input) return;

        const value = input.value;
        const cursorPosition = input.selectionStart || 0;
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
                input.focus();
                const newCursorPosition = startPos + username.length;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }

        setShowMentions(false);
    };

    return (
        <Form {...form}>
            <form
                className='comment-form'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt='Profile image'
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </FormLabel>
                            <div className="relative flex-1">
                                <FormControl className='border-none bg-transparent'>
                                    <Input
                                        type="text"
                                        placeholder="Comment... Use @username to tag someone"
                                        className="no-focus text-light-1 outline-none"
                                        {...field}
                                        ref={inputRef}
                                        onChange={(e) => handleInputChange(e, field.onChange)}
                                        disabled={isSubmitting}
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
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn' disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Reply'}
                </Button>
            </form>
            <p className="text-subtle-medium text-gray-1 mt-2 ml-14">
                Tip: Tag users with @username to notify them
            </p>
        </Form>
    )
};

export default Comment;