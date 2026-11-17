import { useContext, useState } from 'react'
import { AppCtx } from '../ctx'
import { TabBar } from '../components'
import { FONTS } from '../fonts'
import type { FontKey } from '../store'

const DOCS: Record<string, string> = {
  'プライバシーポリシー': 'これは検証用プロトタイプの仮の文面です。メモと曲のデータは、お使いの端末のブラウザ内にだけ保存され、外部には送信されません。',
  '利用規約': 'これは検証用プロトタイプの仮の文面です。正式版の公開時に、あらためて利用規約を定めます。',
}

export default function Settings() {
  const { data, update } = useContext(AppCtx)
  const [doc, setDoc] = useState<string | null>(null)
  const set = (p: Partial<typeof data.settings>) => update((d) => ({ ...d, settings: { ...d.settings, ...p } }))
  return <div className="screen">
    <header className="top"><div className="ttl"><div><h1>設定</h1><div className="sub">表示とアーティスト名</div></div></div></header>
    <div className="body" style={{ paddingBottom: 20 }}>
      <div className="brand"><img src="/logo.svg" alt="" /><h2 className="logotype">メモ<b>歌詞</b></h2><p>バージョン 0.1 ／ プロトタイプ</p></div>
      <div className="setsec"><span className="label">アーティスト名</span></div>
      <div className="cardf card"><div className="k">ジャケットと曲詳細に表示されます</div>
        <input className="inp" value={data.settings.artist} onChange={(e) => set({ artist: e.target.value })} placeholder="アーティスト名" /></div>
      <div className="setsec"><span className="label">表示</span></div>
      <div className="list card"><button className="r" onClick={() => set({ dark: !data.settings.dark })}>
        <span>ダークモード<small>{data.settings.dark ? 'オン' : 'オフ'}</small></span>
        <span className={`tg${data.settings.dark ? ' on' : ''}`} role="switch" aria-checked={data.settings.dark}><i /></span></button></div>
      <div className="setsec"><span className="label">入力・出力の書体</span></div>
      <div className="list card">{(Object.keys(FONTS) as FontKey[]).map((k) => <button key={k} className="r" onClick={() => set({ font: k })}>
        <span style={{ fontFamily: FONTS[k].family }}>{FONTS[k].label}<small style={{ fontFamily: FONTS[k].family }}>帰り道、信号が青になるのを</small></span>
        <span className={`tg${data.settings.font === k ? ' on' : ''}`} role="radio" aria-checked={data.settings.font === k}><i /></span></button>)}</div>
      <div className="setsec"><span className="label">情報</span></div>
      <div className="list card">{Object.keys(DOCS).map((k) => <button key={k} className="r" onClick={() => setDoc(k)}><span>{k}</span><span className="ch">›</span></button>)}</div>
    </div>
    {doc && <div className="modal" onClick={() => setDoc(null)}><div onClick={(e) => e.stopPropagation()}><h2>{doc}</h2><p>{DOCS[doc]}</p><button className="btn alt big" onClick={() => setDoc(null)}>閉じる</button></div></div>}
    <TabBar now="settings" />
  </div>
}
