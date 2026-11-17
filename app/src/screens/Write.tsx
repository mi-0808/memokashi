import { useContext, useMemo, useState } from 'react'
import { AppCtx } from '../ctx'
import { moraOf, splitLines } from '../lyrics'
import { uid } from '../store'

export default function Write() {
  const { data, update, tokenize, ready, go } = useContext(AppCtx)
  const [text, setText] = useState('')
  const [folderId, setFolderId] = useState(data.folders[0].id)
  const lines = useMemo(() => splitLines(text), [text])
  const total = useMemo(() => lines.reduce((n, l) => n + moraOf(l, tokenize), 0), [lines, tokenize])

  const pick = (v: string) => {
    if (v !== '__new') return setFolderId(v)
    const name = window.prompt('新しいフォルダの名前')?.trim()
    if (!name) return
    const id = uid(); update((d) => ({ ...d, folders: [...d.folders, { id, name }] })); setFolderId(id)
  }
  const close = () => {
    if (text.trim()) update((d) => ({ ...d, memos: [...d.memos, { id: uid(), folderId, text: text.trim(), createdAt: new Date().toISOString() }] }))
    go({ n: 'library' })
  }
  return <div className="screen write">
    <div className="meta">
      <button className="round" aria-label="戻る（保存して閉じる）" onClick={close}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>
      <select value={folderId} onChange={(e) => pick(e.target.value)} aria-label="保存先フォルダ">
        {data.folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        <option value="__new">＋ 新しいフォルダ</option>
      </select>
    </div>
    <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="いま浮かんだことを、そのまま。" />
    <div className="ft">
      <span className="n">{lines.length}行 ／ {total}音{ready ? '' : '（概算）'}</span>
      <button className="btn tap" onClick={close}>閉じて保存</button>
    </div>
  </div>
}
