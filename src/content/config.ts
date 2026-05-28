import { defineCollection, z } from 'astro:content'

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { notes }
