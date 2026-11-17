import { useContext, useMemo } from 'react'
import { AppCtx } from '../ctx'
import { Back } from '../components'
import { layout, moraOf, splitLines, type Line } from '../lyrics'
import { uid } from '../store'
import { dayKey, fmtDay, fmtTime } from '../util'

export default function Folder({ id }: { id: string }) {
  const { data, tokenize, go } = useContext(AppCtx)
  const folder = data.folders.find((f) => f.id === id)!
  const memos = useMemo(() => data.memos.filter((m) => m.folderId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [data.memos, id])
  const rows = useMemo(() => memos.map((m) => {
    const ls = splitLines(m.text)
    return { m, lines: ls.length, mora: ls.reduce((a, l) => a + moraOf(l, tokenize), 0) }
  }), [memos, tokenize])
  const totalMora = rows.reduce((a, r) => a + r.mora, 0), totalLines = rows.reduce((a, r) => a + r.lines, 0)
  const days = [...new Set(memos.map((m) => dayKey(m.createdAt)))]

  const make = () => {
    const lines: Line[] = memos.flatMap((m) => splitLines(m.text).map((t) => ({ id: uid(), text: t, date: m.createdAt })))
    go({ n: 'lyrics', folderId: id, sections: layout(lines, tokenize) })
  }
  return <div className="screen">
    <header className="top"><div className="ttl"><div className="l"><Back to={{ n: 'library' }} />
      <div><h1>{folder.name}</h1><div className="sub">{memos.length ? `${fmtDay(memos[0].createdAt)} から` : 'まだメモがありません'}</div></div></div></div>
      <div className="stats"><div><b>{memos.length}</b><span>メモ</span></div><div><b>{totalMora}</b><span>総音数</span></div><div><b>{totalLines}</b><span>行</span></div></div>
    </header>
    <div className="body" style={{ paddingBottom: 16 }}>
      {memos.length === 0 && <p className="empty">書く画面で書いたメモが、ここにたまります。</p>}
      {[...days].reverse().map((d) => <div key={d}>
        <div className="day">{fmtDay(rows.find((r) => dayKey(r.m.createdAt) === d)!.m.createdAt)}</div>
        {rows.filter((r) => dayKey(r.m.createdAt) === d).map(({ m, mora }) =>
          <div key={m.id} className="memo card"><p>{m.text}</p><div className="m">{fmtTime(m.createdAt)} ／ <em>{mora}音</em></div></div>)}
      </div>)}
    </div>
    <div className="foot"><button className="btn big" disabled={!totalLines} onClick={make}>♪ 一曲にする</button></div>
  </div>
}
