import { useContext, useMemo } from 'react'
import { AppCtx } from '../ctx'
import { Jacket, TabBar } from '../components'
import { moraOf, splitLines } from '../lyrics'
import { streak } from '../util'

export default function Library() {
  const { data, tokenize, go } = useContext(AppCtx)
  const songs = [...data.songs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const days = streak(data.memos)
  const info = useMemo(() => data.folders.map((f) => {
    const ms = data.memos.filter((m) => m.folderId === f.id)
    return { f, n: ms.length, mora: ms.reduce((a, m) => a + splitLines(m.text).reduce((s, l) => s + moraOf(l, tokenize), 0), 0) }
  }), [data.folders, data.memos, tokenize])
  return <div className="screen">
    <header className="top"><div className="ttl">
      <div><div className="logo-h"><img src="/logo.svg" alt="" /><h1>ライブラリ</h1></div>
        <div className="sub">{songs.length}曲 ／ {data.folders.length}フォルダ</div></div>
      {days > 0 && <span className="chip">{days}日連続</span>}
    </div></header>
    <div className="body" style={{ paddingBottom: 90 }}>
      <div className="sec-h">最近の曲</div>
      {songs.length === 0 ? <p className="empty card" style={{ border: 'none' }}>まだ曲はありません。<br />メモをためて「一曲にする」を押すと、ここにジャケットが並びます。</p> :
        <div className="row">{songs.map((s) => <button key={s.id} className="sc" onClick={() => go({ n: 'song', id: s.id })}>
          <Jacket bg={s.bg} shape={s.shape} color={s.shapeColor} /><h3>{s.title}</h3><p>{s.artist}</p></button>)}</div>}
      <div className="sec-h">制作中のフォルダ</div>
      {info.map(({ f, n, mora }) => <button key={f.id} className="fl card" onClick={() => go({ n: 'folder', id: f.id })}>
        <div className="cass"><i style={{ left: 8 }} /><i style={{ right: 8 }} /></div>
        <div style={{ flex: 1 }}><b>{f.name}</b><em>{n}メモ ／ {mora}音</em><div className="bar"><i style={{ width: `${Math.min(n / 10, 1) * 100}%` }} /></div></div>
      </button>)}
    </div>
    <button className="fab tap" onClick={() => go({ n: 'write' })}>✎ 書く</button>
    <TabBar now="library" />
  </div>
}
