import { useContext } from 'react'
import { AppCtx, type Screen } from './ctx'
import type { Shape } from './store'

export function Jacket({ bg, shape, color, size }: { bg: string; shape: Shape; color: string; size?: number }) {
  return <div className="jk" style={{ background: bg, ...(size ? { width: size, height: size } : {}) }}><i className={shape} style={{ background: color }} /></div>
}

export function TabBar({ now }: { now: 'library' | 'folders' | 'settings' }) {
  const { go } = useContext(AppCtx)
  const T: [typeof now, string, string, Screen][] = [['library', 'ライブラリ', '', { n: 'library' }], ['folders', 'フォルダ', 'c', { n: 'folders' }], ['settings', '設定', 's', { n: 'settings' }]]
  return <nav className="tabs">{T.map(([k, name, ic, to]) =>
    <button key={k} className={now === k ? 'on' : ''} onClick={() => go(to)}><span className={`ic ${ic}`} />{name}</button>)}</nav>
}

export const Back = ({ to }: { to: Screen }) => {
  const { go } = useContext(AppCtx)
  // 文字の「‹」は小さく細いので、曲詳細・書く画面と同じ線の矢印にする
  return <button className="back tap" aria-label="戻る" onClick={() => go(to)}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
}
