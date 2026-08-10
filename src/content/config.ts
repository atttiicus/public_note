import { defineCollection, z } from 'astro:content'

const notes = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date().optional(),
        tags: z.array(z.string()).optional(),
        series: z.string().optional(),
        order: z.number().optional(),
    }),
})

const posts = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDatetime: z.date(),
        modDatetime: z.date().optional().nullable(),
        tags: z.array(z.string()).default(['others']),
        coverImage: z.string().optional(),
        draft: z.boolean().optional(),
    }),
})

export const collections = { notes, posts }
