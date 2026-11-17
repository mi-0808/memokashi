import { useContext, useEffect } from 'react'
import { AppCtx } from '../ctx'

export default function Splash() {
  const { go } = useContext(AppCtx)
  useEffect(() => { const t = setTimeout(() => go({ n: 'write' }), 1100); return () => clearTimeout(t) }, [go])
  return <div className="screen splash">
    <img src="/logo.svg" alt="" />
    <h1 className="logotype">メモ<b>歌詞</b></h1>
    <p>ふと浮かんだ記憶のかけらを、<br />あなただけの一曲に。</p>
  </div>
}
