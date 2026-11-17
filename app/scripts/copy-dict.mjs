// kuromoji の辞書(約17MB)を public/dict へコピーする。ブラウザは XHR でここから読むため。
import { cpSync, mkdirSync, existsSync } from 'node:fs'
const src = 'node_modules/kuromoji/dict'
if (existsSync(src)) { mkdirSync('public/dict', { recursive: true }); cpSync(src, 'public/dict', { recursive: true }) }
