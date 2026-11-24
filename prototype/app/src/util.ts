import type { Memo } from './store'

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export const fmtDay = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}月${d.getDate()}日` }
export const fmtTime = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
export const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` }

/** 今日(まだ書いていなければ昨日)から数えて、連続して書いた日数 */
export function streak(memos: Memo[]): number {
  const days = new Set(memos.map((m) => dayKey(m.createdAt)))
  const d = new Date(); let n = 0
  if (!days.has(dayKey(d.toISOString()))) d.setDate(d.getDate() - 1)
  while (days.has(dayKey(d.toISOString()))) { n++; d.setDate(d.getDate() - 1) }
  return n
}
