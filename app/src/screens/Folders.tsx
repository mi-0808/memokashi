import { useContext } from 'react'
import { AppCtx } from '../ctx'
import { TabBar } from '../components'
import { uid } from '../store'

export default function Folders() {
  const { data, update, go } = useContext(AppCtx)
  const add = () => {
    const name = window.prompt('新しいフォルダの名前')?.trim()
    if (name) update((d) => ({ ...d, folders: [...d.folders, { id: uid(), name }] }))
  }
  return <div className="screen">
    <header className="top"><div className="ttl"><div><h1>フォルダ</h1><div className="sub">曲になる前の記憶の置き場</div></div></div></header>
    <div className="body" style={{ paddingBottom: 20 }}>
      {data.folders.map((f) => {
        const n = data.memos.filter((m) => m.folderId === f.id).length
        return <button key={f.id} className="fl card" onClick={() => go({ n: 'folder', id: f.id })} style={{ marginTop: 12 }}>
          <div className="cass"><i style={{ left: 8 }} /><i style={{ right: 8 }} /></div>
          <div style={{ flex: 1 }}><b>{f.name}</b><em>{n}メモ</em></div></button>
      })}
      <div style={{ padding: '18px 20px' }}><button className="btn alt big" onClick={add}>＋ 新しいフォルダ</button></div>
    </div>
    <TabBar now="folders" />
  </div>
}
