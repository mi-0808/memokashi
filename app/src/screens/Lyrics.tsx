import { useContext, useMemo, useState } from 'react'
import { AppCtx } from '../ctx'
import { Back } from '../components'
import { annotate, layout, type Line, type Sections } from '../lyrics'
import { uid } from '../store'
import { fmtDate } from '../util'

type K = keyof Sections
const SECS: [K, string][] = [['verse1', '1番'], ['chorus', 'サビ'], ['verse2', '2番']]

export default function Lyrics({ folderId, sections: init }: { folderId: string; sections: Sections }) {
  const { tokenize, go } = useContext(AppCtx)
  const [s, setS] = useState<Sections>(init)
  const [drag, setDrag] = useState<{ k: K; i: number } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [edit, setEdit] = useState<{ k: K; i: number } | null>(null)
  const notes = useMemo(() => {
    const all = [...s.verse1, ...s.chorus, ...s.verse2]
    return { verse1: annotate(s.verse1, tokenize, all), chorus: annotate(s.chorus, tokenize, all), verse2: annotate(s.verse2, tokenize, all) }
  }, [s, tokenize])
  const total = s.verse1.length + s.chorus.length + s.verse2.length

  const move = (to: K, at: number) => {
    if (!drag) return
    setS((cur) => {
      const next = { verse1: [...cur.verse1], chorus: [...cur.chorus], verse2: [...cur.verse2] }
      const [item] = next[drag.k].splice(drag.i, 1)
      next[to].splice(drag.k === to && drag.i < at ? at - 1 : at, 0, item)
      return next
    })
    setDrag(null); setOver(null)
  }
  const patch = (k: K, i: number, f: (l: Line) => Line | null) =>
    setS((cur) => ({ ...cur, [k]: cur[k].flatMap((l, j) => (j === i ? (f(l) ? [f(l)!] : []) : [l])) }))
  const auto = () => setS(layout([...s.verse1, ...s.chorus, ...s.verse2], tokenize))
  const add = () => { setS((c) => ({ ...c, verse1: [...c.verse1, { id: uid(), text: '', date: new Date().toISOString() }] })); setEdit({ k: 'verse1', i: s.verse1.length }) }

  return <div className="screen">
    <header className="top"><div className="ttl"><div className="l"><Back to={{ n: 'folder', id: folderId }} />
      <div><h1>作詞</h1><div className="sub">{total}行 ／ ドラッグで並べ替え</div></div></div>
      <button className="chip" onClick={auto}>自動で並べる</button></div></header>
    <div className="body">
      {SECS.map(([k, name]) => <div className="blk" key={k}><h3>{name}</h3>
        <div className="zone" onDragOver={(e) => { e.preventDefault(); setOver(`${k}-end`) }} onDrop={() => move(k, s[k].length)}>
          {s[k].map((l, i) => {
            const n = notes[k][i]
            const head = n.rhyme ? [...l.text].slice(0, -2).join('') : l.text
            return <div key={l.id} className={`ln${n.pair ? ' pair' : ''}${over === `${k}-${i}` ? ' over' : ''}`} draggable
              onDragStart={() => setDrag({ k, i })} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver(`${k}-${i}`) }}
              onDrop={(e) => { e.stopPropagation(); move(k, i) }} onDragEnd={() => { setDrag(null); setOver(null) }}>
              <span className="gr" aria-hidden>⋮⋮</span>
              <div className="tx">
                {edit?.k === k && edit.i === i
                  ? <input autoFocus value={l.text} onChange={(e) => patch(k, i, (x) => ({ ...x, text: e.target.value }))}
                      onBlur={() => { if (!l.text.trim()) patch(k, i, () => null); setEdit(null) }} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
                  : <button style={{ textAlign: 'left', width: '100%' }} onClick={() => setEdit({ k, i })}>
                      {head}{n.rhyme && <span className="rhy">{n.tail}</span>}
                      <span className="src">{fmtDate(l.date)} のメモ</span></button>}
              </div>
              <span className="mo">{n.mora}</span>
              <button className="x" aria-label="削除" onClick={() => patch(k, i, () => null)}>×</button>
            </div>
          })}
          {s[k].length === 0 && <p className="note" style={{ margin: '4px 0' }}>この枠は空です。行をここへドラッグできます。</p>}
        </div></div>)}
      <p className="note"><i />行末の母音がそろう行（韻の候補）／ オレンジの数字は音数が近い行</p>
    </div>
    <div className="foot">
      <button className="btn alt tap" style={{ flex: '0 0 112px' }} onClick={add}>行を足す</button>
      <button className="btn" style={{ flex: 1 }} disabled={!total} onClick={() => go({ n: 'cover', folderId, sections: s })}>ジャケットへ</button>
    </div>
  </div>
}
