import { useEffect, useMemo, useState } from 'react'
import { AppCtx, type Ctx, type Screen } from './ctx'
import { useData } from './store'
import { FONTS } from './fonts'
import { useTokenizer } from './tokenizer'
import Splash from './screens/Splash'
import Write from './screens/Write'
import Library from './screens/Library'
import Folders from './screens/Folders'
import Folder from './screens/Folder'
import Lyrics from './screens/Lyrics'
import Cover from './screens/Cover'
import Song from './screens/Song'
import Settings from './screens/Settings'

export default function App() {
  const [data, update] = useData()
  const { tokenize, ready } = useTokenizer()
  const [screen, go] = useState<Screen>({ n: 'splash' })
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => { document.documentElement.dataset.theme = data.settings.dark ? 'dark' : 'light' }, [data.settings.dark])
  // 入力・出力の文字の書体（書く欄、メモ、歌詞、歌詞カード）。画面の見出しなどは M PLUS Rounded のまま
  useEffect(() => { document.documentElement.style.setProperty('--text-font', FONTS[data.settings.font ?? 'system'].family) }, [data.settings.font])
  const ctx: Ctx = useMemo(() => ({
    data, update, tokenize, ready, go,
    toast: (m) => { setMsg(m); setTimeout(() => setMsg(null), 1800) },
  }), [data, update, tokenize, ready])
  // 画面ごとに state を作り直す（作詞の編集中の状態などを持ち越さない）
  const key = screen.n + ('id' in screen ? screen.id : '')
  return <AppCtx.Provider value={ctx}><div className="app">
    {screen.n === 'splash' && <Splash key={key} />}
    {screen.n === 'write' && <Write key={key} />}
    {screen.n === 'library' && <Library key={key} />}
    {screen.n === 'folders' && <Folders key={key} />}
    {screen.n === 'folder' && <Folder key={key} id={screen.id} />}
    {screen.n === 'lyrics' && <Lyrics key={key} folderId={screen.folderId} sections={screen.sections} />}
    {screen.n === 'cover' && <Cover key={key} folderId={screen.folderId} sections={screen.sections} songId={screen.songId} />}
    {screen.n === 'song' && <Song key={key} id={screen.id} />}
    {screen.n === 'settings' && <Settings key={key} />}
    {msg && <div className="toast">{msg}</div>}
  </div></AppCtx.Provider>
}
