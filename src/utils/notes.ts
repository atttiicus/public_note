import type { CollectionEntry } from 'astro:content'

export const ITEMS_PER_PAGE = 10

export interface SeriesGroup {
    name: string
    items: Array<{ slug: string; title: string; description?: string; order?: number }>
    tags: string[]
}

export type RenderItem =
    | { type: 'single'; note: CollectionEntry<'notes'> }
    | { type: 'series'; group: SeriesGroup }

export function buildRenderItems(notes: CollectionEntry<'notes'>[]): RenderItem[] {
    const sorted = [...notes].sort((a, b) =>
        a.data.title.localeCompare(b.data.title, 'zh-CN')
    )

    const renderItems: RenderItem[] = []
    const seriesMap: Record<string, SeriesGroup> = {}

    for (const note of sorted) {
        const series = note.data.series
        if (series) {
            if (!seriesMap[series]) {
                seriesMap[series] = { name: series, items: [], tags: [] }
                renderItems.push({ type: 'series', group: seriesMap[series] })
            }
            const g = seriesMap[series]
            g.items.push({
                slug: note.slug,
                title: note.data.title,
                description: note.data.description,
                order: note.data.order,
            })
            for (const tag of note.data.tags ?? []) {
                if (!g.tags.includes(tag)) g.tags.push(tag)
            }
        } else {
            renderItems.push({ type: 'single', note })
        }
    }

    for (const group of Object.values(seriesMap)) {
        group.items.sort((a, b) => {
            const oa = a.order ?? Infinity
            const ob = b.order ?? Infinity
            if (oa !== ob) return oa - ob
            return a.title.localeCompare(b.title, 'zh-CN')
        })
    }

    return renderItems
}

export function getPage(allItems: RenderItem[], page: number) {
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE)
    const start = (page - 1) * ITEMS_PER_PAGE
    return {
        pageItems: allItems.slice(start, start + ITEMS_PER_PAGE),
        totalPages,
    }
}
