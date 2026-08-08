import { useState, useCallback } from 'react'

/**
 * 时间线排序切换 — 悬浮方形按钮
 * 排序通过反转 .tl-row DOM 子节点实现，O(n)
 */
export default function TimelineSortToggle() {
    const [newestFirst, setNewestFirst] = useState(true)

    const toggle = useCallback(() => {
        const container = document.querySelector('.timeline')
        if (!container) return
        const rows = Array.from(container.querySelectorAll(':scope > .tl-row'))
        for (let i = rows.length - 1; i >= 0; i--) {
            container.appendChild(rows[i])
        }
        setNewestFirst((prev) => !prev)
    }, [])

    const label = newestFirst ? '最新在前 · 点击切换' : '最早在前 · 点击切换'

    return (
        <button onClick={toggle} className="sort-btn" title={label} aria-label={label}>
            <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="5" x2="12" y2="19" />
                {newestFirst ? (
                    <polyline points="16 9 12 5 8 9" />
                ) : (
                    <polyline points="16 15 12 19 8 15" />
                )}
            </svg>
        </button>
    )
}
