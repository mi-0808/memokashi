import { useEffect, useState } from 'react'
import type { Tokenize } from './lyrics'

/** 辞書の読み込み前に使う仮のトークナイザ: 全体を1語として扱う（かなは読み、他は字数で数える） */
const fallback: Tokenize = (s) => [{ surface_form: s, pos: '名詞' }]

let cached: Promise<Tokenize> | null = null
function load(): Promise<Tokenize> {
  cached ??= import('kuromoji/build/kuromoji.js').then(
    ({ default: k }) => new Promise<Tokenize>((ok, ng) =>
      k.builder({ dicPath: '/dict/' }).build((e, t) => (e ? ng(e) : ok((s) => t.tokenize(s) as never)))))
  return cached
}

/** 辞書(約17MB)を読み込み、完了までは仮のトークナイザを返す */
export function useTokenizer(): { tokenize: Tokenize; ready: boolean } {
  const [tk, setTk] = useState<Tokenize | null>(null)
  useEffect(() => { load().then((t) => setTk(() => t)).catch(() => { /* 読み込み失敗時は仮の数え方のまま */ }) }, [])
  return { tokenize: tk ?? fallback, ready: !!tk }
}
