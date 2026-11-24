import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// kuromoji は辞書(.dat.gz)を自分で展開する。サーバーが Content-Encoding: gzip を付けると
// ブラウザが先に展開してしまい「invalid file signature」で失敗するため、/dict だけ印を外す。
const rawDict = (): Plugin => {
  type Res = { setHeader: (k: string, v: unknown) => unknown; writeHead: (...a: unknown[]) => unknown }
  const mw = (_req: unknown, res: Res, next: () => void) => {
    const set = res.setHeader.bind(res), head = res.writeHead.bind(res)
    res.setHeader = (k, v) => (k.toLowerCase() === 'content-encoding' ? res : set(k, v))
    // 静的配信は writeHead にヘッダーをまとめて渡すので、そちらからも外す
    res.writeHead = (...a) => {
      for (const x of a) if (x && typeof x === 'object' && !Array.isArray(x)) for (const k of Object.keys(x)) if (k.toLowerCase() === 'content-encoding') delete (x as Record<string, unknown>)[k]
      return head(...a)
    }
    next()
  }
  return {
    name: 'raw-dict',
    configureServer: (s) => void s.middlewares.use('/dict', mw as never),
    configurePreviewServer: (s) => void s.middlewares.use('/dict', mw as never),
  }
}

// LAN=1 のときだけ https にする。共有(Web Share)とクリップボードは https でないと動かないため、
// スマホ実機で試すには自己署名の証明書が要る（ブラウザの警告を一度許可する）。
const lan = !!process.env.LAN
export default defineConfig({ plugins: [react(), rawDict(), ...(lan ? [basicSsl()] : [])], server: { port: 5173, host: lan } })
