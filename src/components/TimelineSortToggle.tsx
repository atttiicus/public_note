import { useState, useCallback } from 'react'

/**
 * 时间线排序切换按钮
 *
 * 性能优化：
 * - 排序切换通过反转 DOM 子节点顺序实现，O(n) 单次遍历，无需重渲染
 * - 使用 useCallback 缓存 toggle 函数，避免子组件不必要的重渲染
 * - 按钮动效仅使用 CSS transition，无 JS 动画开销
 */
export default function TimelineSortToggle() {
    const [newestFirst, setNewestFirst] = useState(true)

    const toggle = useCallback(() => {
        const container = document.querySelector('.timeline')
        if (!container) return
        // 反转 .tl-row 的 DOM 顺序，O(n) 单次遍历
        const rows = Array.from(container.querySelectorAll(':scope > .tl-row'))
        for (let i = rows.length - 1; i >= 0; i--) {
            container.appendChild(rows[i])
        }
        setNewestFirst((prev) => !prev)
    }, [])

    return (
        <button
            onClick={toggle}
            className="sort-toggle-btn"
            title={newestFirst ? '当前：最新在前，点击切换' : '当前：最早在前，点击切换'}
            aria-label={newestFirst ? '切换为最早在前' : '切换为最新在前'}
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
                className="sort-icon"
            >
                <line x1="4" y1="6" x2="13" y2="6" />
                <line x1="4" y1="12" x2="18" y2="12" />
                <line x1="4" y1="18" x2="9" y2="18" />
                {newestFirst ? (
                    <polyline points="16 9 20 5 20 9" />
                ) : (
                    <polyline points="20 15 16 19 16 15" />
                )}
                {newestFirst ? (
                    <polyline points="20 5 20 17" />
                ) : (
                    <polyline points="16 19 16 7" />
                )}
            </svg>
            <span>{newestFirst ? '最新在前' : '最早在前'}</span>
        </button>
    )
}
