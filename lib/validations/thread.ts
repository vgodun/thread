import * as z from 'zod';

export const ThreadValidation=z.object({
    thread:z.string().nonempty().min(3,{message:'Minimum 3 characters'}),
    accountId:z.string(),
imgPosts:z.string().optional(),
})

export const ThreadEdits=z.object({
        text:z.string().nonempty().min(3,{message:'Minimum 3 characters'}),
        imgPosts:z.string().optional(),
    })

export const CommentValidation=z.object({
    thread:z.string().nonempty().min(3,{message:'Minimum 3 characters'}),
})