import { useState, useCallback, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'

export interface NoteItem {
    slug: string
    title: string
    description?: string
    tags?: string[]
    content: string
    series?: string
}

interface SearchResult {
    item: NoteItem
    matches?: readonly Fuse.FuseResultMatch[]
}

function highlight(text: string, indices: readonly [number, number][] | undefined): string {
    if (!indices || indices.length === 0) return text
    let result = ''
    let cursor = 0
    for (const [start, end] of indices) {
        result += text.slice(cursor, start)
        result += `<mark>${text.slice(start, end + 1)}</mark>`
        cursor = end + 1
    }
    result += text.slice(cursor)
    return result
}

function getMatchIndices(
    matches: readonly Fuse.FuseResultMatch[] | undefined,
    key: string
): readonly [number, number][] | undefined {
    return matches?.find((m) => m.key === key)?.indices as readonly [number, number][] | undefined
}

function getContentSnippet(content: string, query: string, maxLen = 120): string {
    const lower = content.toLowerCase()
    const idx = lower.indexOf(query.toLowerCase())
    if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? '…' : '')
    const start = Math.max(0, idx - 30)
    const end = Math.min(content.length, idx + query.length + 90)
    return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
}

export default function Search({ notes }: { notes: NoteItem[] }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const fuse = useRef(
        new Fuse(notes, {
            keys: [
                { name: 'title', weight: 3 },
                { name: 'description', weight: 2 },
                { name: 'tags', weight: 2 },
                { name: 'content', weight: 1 },
            ],
            threshold: 0.35,
            includeMatches: true,
            minMatchCharLength: 1,
            ignoreLocation: true,
        })
    )

    const handleSearch = useCallback((q: string) => {
        setQuery(q)
        if (!q.trim()) {
            setResults([])
            return
        }
        const raw = fuse.current.search(q, { limit: 20 })
        setResults(raw as SearchResult[])
    }, [])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    return (
        <div className="search-root">
            <div className="search-bar">
                <svg
                    className="search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    ref={inputRef}
                    className="search-input"
                    type="search"
                    placeholder="搜索标题、内容、标签…"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                />
                {query && (
                    <button
                        className="search-clear"
                        onClick={() => handleSearch('')}
                        aria-label="清空"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {query.trim() && (
                <p className="search-count">
                    {results.length > 0 ? `找到 ${results.length} 条结果` : '没有找到匹配的笔记'}
                </p>
            )}

            {results.length > 0 && (
                <ul className="search-results">
                    {results.map(({ item, matches }) => {
                        const titleIndices = getMatchIndices(matches, 'title')
                        const descIndices = getMatchIndices(matches, 'description')
                        const contentMatched = matches?.some((m) => m.key === 'content')
                        const snippet = contentMatched
                            ? getContentSnippet(item.content, query)
                            : (item.description ?? item.content.slice(0, 100))

                        return (
                            <li key={item.slug} className="search-result-item">
                                <a href={`/notes/${item.slug}`} className="search-result-link">
                                    <div className="search-result-body">
                                        <span
                                            className="search-result-title"
                                            dangerouslySetInnerHTML={{
                                                __html: highlight(item.title, titleIndices),
                                            }}
                                        />
                                        {item.series && (
                                            <span className="search-result-series">
                                                {item.series}
                                            </span>
                                        )}
                                        {snippet && (
                                            <span
                                                className="search-result-snippet"
                                                dangerouslySetInnerHTML={{
                                                    __html: descIndices
                                                        ? highlight(
                                                              item.description ?? snippet,
                                                              descIndices
                                                          )
                                                        : snippet,
                                                }}
                                            />
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="search-result-tags">
                                                {item.tags.map((t) => (
                                                    <span key={t} className="search-result-tag">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="search-result-arrow">→</span>
                                </a>
                            </li>
                        )
                    })}
                </ul>
            )}

            {!query.trim() && (
                <div className="search-empty">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.25 }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p>输入关键词开始搜索</p>
                </div>
            )}
        </div>
    )
}
