import { useContext, useState } from 'react'
import { AppCtx } from '../ctx'
import { Back, Jacket } from '../components'
import type { Sections } from '../lyrics'
import { uid, type Shape } from '../store'

const COLORS: [string, string][] = [['#3A2418', 'こげ茶'], ['#FF7A2F', 'オレンジ'], ['#FFD9BF', 'うすオレンジ'], ['#8A5A3C', 'ブラウン'], ['#FFF6EE', 'クリーム']]
const SHAPES: [Shape, string, React.CSSProperties][] = [['circle', 'まる', { borderRadius: '50%' }], ['triangle', 'さんかく', { clipPath: 'polygon(50% 6%,96% 94%,4% 94%)' }], ['square', 'しかく', { borderRadius: 3 }]]

export default function Cover({ folderId, sections, songId }: { folderId: string; sections: Sections; songId?: string }) {
  const { data, update, go } = useContext(AppCtx)
  const folder = data.folders.find((f) => f.id === folderId)!
  const old = songId ? data.songs.find((s) => s.id === songId) : undefined // 曲詳細から開いたときは、今のジャケットから始める
  const [bg, setBg] = useState(old?.bg ?? '#FFD9BF'), [shape, setShape] = useState<Shape>(old?.shape ?? 'circle'), [color, setColor] = useState(old?.shapeColor ?? '#FF7A2F')
  const [title, setTitle] = useState(old?.title ?? folder.name), [artist, setArtist] = useState(old?.artist ?? data.settings.artist)

  const save = () => {
    if (old) {
      update((d) => ({ ...d, songs: d.songs.map((s) => (s.id === old.id ? { ...s, title: title.trim() || '無題', artist: artist.trim(), bg, shape, shapeColor: color } : s)) }))
      return go({ n: 'song', id: old.id })
    }
    const dates = [...new Set([...sections.verse1, ...sections.chorus, ...sections.verse2].map((l) => l.date))].sort()
    const id = uid()
    update((d) => ({ ...d, songs: [...d.songs, { id, folderId, title: title.trim() || '無題', artist: artist.trim(), bg, shape, shapeColor: color, sections, memoDates: dates, createdAt: new Date().toISOString() }] }))
    go({ n: 'song', id })
  }
  const Sw = ({ cur, set }: { cur: string; set: (c: string) => void }) =>
    <div className="sw">{COLORS.map(([c, n]) => <button key={c} className={`tap${cur === c ? ' on' : ''}`} style={{ background: c }} aria-label={n} onClick={() => set(c)} />)}</div>
  return <div className="screen">
    <header className="top"><div className="ttl"><div className="l"><Back to={old ? { n: 'song', id: old.id } : { n: 'lyrics', folderId, sections }} />
      <div><h1>ジャケット</h1><div className="sub">色と図形で、曲の顔をつくる</div></div></div></div></header>
    <div className="body" style={{ paddingBottom: 18 }}>
      <div className="stage"><Jacket bg={bg} shape={shape} color={color} size={230} /><div className="cap"><b>{title || '無題'}</b><span>{artist}</span></div></div>
      <div className="grp"><span className="label">背景の色</span><Sw cur={bg} set={setBg} /></div>
      <div className="grp"><span className="label">図形</span><div className="shp">{SHAPES.map(([k, n, st]) =>
        <button key={k} className={`tap${shape === k ? ' on' : ''}`} aria-label={n} onClick={() => setShape(k)}><i style={st} /></button>)}</div></div>
      <div className="grp"><span className="label">図形の色</span><Sw cur={color} set={setColor} /></div>
      <div className="grp"><span className="label">曲名とアーティスト名</span>
        <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="曲名" />
        <input className="inp" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="アーティスト名" /></div>
    </div>
    <div className="foot"><button className="btn big" onClick={save}>{old ? '変更を保存する' : 'この曲を保存する'}</button></div>
  </div>
}
