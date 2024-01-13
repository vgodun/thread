import * as z from 'zod';

export const ThreadValidation=z.object({
    thread:z.string().nonempty().min(1,{message:'Minimum 1 characters'}),
    accountId:z.string(),
imgPosts:z.string().optional(),
})

export const ThreadEdits=z.object({
        text:z.string().nonempty().min(1,{message:'Minimum 1 characters'}),
        imgPosts:z.string().optional(),
    })

export const CommentValidation=z.object({
    thread:z.string().nonempty().min(1,{message:'Minimum 1 characters'}),
})