import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

const BG = { light: '#fdfaf6', dark: '#1e1a16' }
const CYCLE: Theme[] = ['light', 'dark', 'system']
const LABELS: Record<Theme, string> = {
  light: '当前：亮色，点击切换为暗色',
  dark: '当前：暗色，点击切换为跟随系统',
  system: '当前：跟随系统，点击切换为亮色',
}

function resolveIsDark(theme: Theme) {
  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme))
}

// 模块级：记录进行中的 timeout，用于连续点击时的清理
let pendingId: ReturnType<typeof setTimeout> | null = null

function withOverlay(fn: () => void, isDark: boolean) {
  // 已有动画进行中 → 立即清理并直接执行，不起新动画
  if (pendingId !== null) {
    clearTimeout(pendingId)
    pendingId = null
    document.getElementById('theme-overlay')?.remove()
    fn()
    return
  }

  // 遮罩直接以不透明度 1 出现，完全遮住页面后再切主题，避免淡入期间的闪烁
  const overlay = document.createElement('div')
  overlay.id = 'theme-overlay'
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999',
    `background:${isDark ? BG.dark : BG.light}`,
    'opacity:1', 'pointer-events:none',
  ].join(';')
  document.body.appendChild(overlay)

  // 等遮罩绘制完毕后切换主题，再淡出
  requestAnimationFrame(() => {
    fn()
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 280ms ease'
      overlay.style.opacity = '0'
      pendingId = setTimeout(() => {
        overlay.remove()
        pendingId = null
      }, 280)
    })
  })
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme | null) ?? 'system'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  // 跟随系统时监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const isDark = mq.matches
      withOverlay(() => document.documentElement.classList.toggle('dark', isDark), isDark)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const handleClick = () => {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]
    const isDark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(next)
    localStorage.setItem('theme', next)
    withOverlay(() => applyTheme(next), isDark)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className="btn-icon"
      style={{ cursor: 'pointer', background: 'none', border: 'none' }}
    >
      {theme === 'light' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      {theme === 'dark' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {theme === 'system' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      )}
    </button>
  )
}
