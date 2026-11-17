import { useContext } from 'react'
import { AppCtx } from '../ctx'
import { Jacket } from '../components'
import { shareSong } from '../share'
import { FONTS } from '../fonts'
import { dayKey, fmtDate } from '../util'

export default function Song({ id }: { id: string }) {
  const { data, go, toast } = useContext(AppCtx)
  const s = data.songs.find((x) => x.id === id)!
  const share = async () => { const r = await shareSong(s, FONTS[data.settings.font ?? 'system'].family); if (r === 'copied') toast('歌詞をコピーしました'); if (r === 'failed') toast('共有できませんでした') }
  const editCover = () => go({ n: 'cover', folderId: s.folderId, sections: s.sections, songId: s.id })
  const days = [...new Set(s.memoDates.map(dayKey))].map((k) => s.memoDates.find((d) => dayKey(d) === k)!).sort().reverse()
  const secs: [string, typeof s.sections.verse1][] = [['1番', s.sections.verse1], ['サビ', s.sections.chorus], ['2番', s.sections.verse2]]
  return <div className="screen">
    <div className="body">
      <div className="hero">
        <button className="round l" aria-label="戻る" onClick={() => go({ n: 'library' })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>
        <button className="round r" aria-label="共有" onClick={share}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" /></svg></button>
        <button className="jk-edit" onClick={editCover} aria-label="ジャケットを変える"><Jacket bg={s.bg} shape={s.shape} color={s.shapeColor} /><span>✎ 変更</span></button><h2>{s.title}</h2>
        <p>{s.artist}{s.artist && ' ／ '}{fmtDate(s.createdAt)} ／ {s.memoDates.length}メモから</p>
      </div>
      <div className="acts"><button className="btn tap" onClick={share}>歌詞カードを保存</button><button className="btn alt tap" onClick={editCover}>ジャケットを変える</button></div>
      <div className="ly card">{secs.filter(([, l]) => l.length).map(([n, l]) => <div key={n}><h3>{n}</h3>{l.map((x) => <p key={x.id}>{x.text}</p>)}</div>)}</div>
      <div className="src-l card"><h3>この曲になった記憶</h3><ul>{days.map((d) => <li key={d}>{fmtDate(d)}</li>)}</ul></div>
    </div>
  </div>
}
