import type { Song } from './store'

export const songText = (s: Song) =>
  [`${s.title}${s.artist ? ` / ${s.artist}` : ''}`, '',
   ...[['1番', s.sections.verse1], ['サビ', s.sections.chorus], ['2番', s.sections.verse2]]
     .filter(([, l]) => (l as Song['sections']['verse1']).length)
     .flatMap(([n, l]) => [`【${n as string}】`, ...(l as Song['sections']['verse1']).map((x) => x.text), ''])].join('\n').trim()

/** 歌詞カードを画像にする（ジャケット + 歌詞）。画像生成AIは使わず canvas で描く */
export async function renderCard(s: Song, family = '-apple-system, "Hiragino Sans", sans-serif'): Promise<Blob> {
  const W = 1080, P = 90
  const secs = [['1番', s.sections.verse1], ['サビ', s.sections.chorus], ['2番', s.sections.verse2]] as const
  const lines = secs.filter(([, l]) => l.length).reduce((n, [, l]) => n + l.length + 1.4, 0)
  const H = 640 + Math.ceil(lines * 78) + 120
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#FFF6EE'; g.fillRect(0, 0, W, H)
  const J = 400, jx = (W - J) / 2, jy = 80
  g.fillStyle = s.bg; g.beginPath(); g.roundRect(jx, jy, J, J, 36); g.fill()
  g.fillStyle = s.shapeColor
  const sz = J * 0.65, cx = jx + J / 2, cy = jy + J / 2
  g.beginPath()
  if (s.shape === 'circle') g.arc(cx, cy, sz / 2, 0, Math.PI * 2)
  else if (s.shape === 'triangle') { g.moveTo(cx, cy - sz / 2); g.lineTo(cx + sz / 2, cy + sz / 2); g.lineTo(cx - sz / 2, cy + sz / 2); g.closePath() }
  else g.roundRect(cx - sz / 2, cy - sz / 2, sz, sz, 10)
  g.fill()
  g.fillStyle = '#3A2418'; g.textAlign = 'center'
  g.font = '800 54px "M PLUS Rounded 1c", sans-serif'; g.fillText(s.title, W / 2, jy + J + 90)
  g.fillStyle = '#8A5A3C'; g.font = '700 32px "M PLUS Rounded 1c", sans-serif'; g.fillText(s.artist, W / 2, jy + J + 140)
  let y = jy + J + 230
  g.textAlign = 'left'
  for (const [n, l] of secs) {
    if (!l.length) continue
    g.fillStyle = '#FF7A2F'; g.beginPath(); g.roundRect(P, y - 34, 100, 46, 12); g.fill()
    g.fillStyle = '#3A2418'; g.font = '800 28px "M PLUS Rounded 1c", sans-serif'; g.fillText(n, P + 16, y)
    y += 70
    g.font = `500 40px ${family}`
    for (const x of l) { g.fillText(x.text, P, y); y += 68 }
    y += 30
  }
  return new Promise((ok, ng) => c.toBlob((b) => (b ? ok(b) : ng(new Error('画像化に失敗'))), 'image/png'))
}

const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); return 'copied' as const } catch { return 'failed' as const } }

/** OS標準の共有シート（画像+テキスト）。非対応の環境では歌詞をコピーする */
export async function shareSong(s: Song, family?: string): Promise<'shared' | 'copied' | 'failed' | 'cancelled'> {
  const text = songText(s)
  try {
    const file = new File([await renderCard(s, family)], `${s.title}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text, title: s.title }); return 'shared' }
    if (navigator.share) { await navigator.share({ text, title: s.title }); return 'shared' }
    return copy(text)
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled'
    return copy(text)
  }
}
