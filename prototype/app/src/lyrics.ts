// 歌詞化ロジック（企画書 §9）。トークナイザは注入する: ブラウザは辞書を非同期で読み込むので、
// 読み込み前後・テストで差し替えられるようにするため。
export type Tok = { surface_form: string; reading?: string; pos: string; pos_detail_1?: string; basic_form?: string }
export type Tokenize = (s: string) => Tok[]
export type Line = { id: string; text: string; date: string }
export type Sections = { verse1: Line[]; chorus: Line[]; verse2: Line[] }
export type Note = { mora: number; pair: boolean; rhyme: boolean; tail: string }

/** 改行と句読点で行に分ける */
export const splitLines = (text: string): string[] =>
  text.split(/[\n。、，,！？!?]+/).map((s) => s.trim()).filter(Boolean)

const toKata = (s: string) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))

/** 行の読み（カタカナ）。辞書にない語は、かなならそのまま、それ以外は字数分として扱う */
export function readingOf(text: string, tokenize: Tokenize): string {
  return tokenize(text).map((t) => t.reading ?? (/^[ぁ-ゖァ-ヺー]+$/.test(t.surface_form) ? toKata(t.surface_form) : t.surface_form)).join('')
}

/** モーラ数。「ャュョァィゥェォヮ」は直前と1拍、「ッ」「ー」「ン」は1拍 */
export const mora = (reading: string): number =>
  [...reading.replace(/[\s、。・！？!?「」『』（）()]/g, '')].filter((c) => !'ャュョァィゥェォヮ'.includes(c)).length

export const moraOf = (text: string, tokenize: Tokenize) => mora(readingOf(text, tokenize))

const V: Record<string, string> = {}
for (const [chars, v] of [['アカサタナハマヤラワガザダバパァャヮヵ', 'a'], ['イキシチニヒミリギジヂビピィ', 'i'], ['ウクスツヌフムユルグズヅブプゥュヴ', 'u'], ['エケセテネヘメレゲゼデベペェヶ', 'e'], ['オコソトノホモヨロヲゴゾドボポォョ', 'o'], ['ン', 'n']] as const)
  for (const c of chars) V[c] = v

/** 行末2拍の母音（韻の判定キー）。「ー」は直前の母音、「ッ」は飛ばす */
export function rhymeKey(reading: string): string {
  const vs: string[] = []
  for (const c of reading) {
    if (c === 'ー') { if (vs.length) vs.push(vs[vs.length - 1]) } else if (V[c]) vs.push(V[c])
  }
  return vs.slice(-2).join('')
}

const SKIP = ['非自立', '代名詞', '接尾', '数', '副詞可能']
/** サビ候補に使う内容語（名詞・動詞・形容詞で2文字以上） */
function contentWords(text: string, tokenize: Tokenize): Set<string> {
  const out = new Set<string>()
  for (const t of tokenize(text)) {
    const w = t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form
    if (['名詞', '動詞', '形容詞'].includes(t.pos) && !SKIP.includes(t.pos_detail_1 ?? '') && w.length >= 2) out.add(w)
  }
  return out
}

/** 1番・サビ・2番へ自動配置する */
export function layout(lines: Line[], tokenize: Tokenize): Sections {
  const ordered = lines.map((l, i) => ({ l, i })).sort((a, b) => a.l.date.localeCompare(b.l.date) || a.i - b.i).map((x) => x.l)
  const words = ordered.map((l) => contentWords(l.text, tokenize))
  const count = new Map<string, number>()
  words.forEach((s) => s.forEach((w) => count.set(w, (count.get(w) ?? 0) + 1)))
  // 繰り返し出る言葉を含む行をサビに（多く含む順に最大4行）
  const hits = ordered
    .map((l, i) => ({ l, n: [...words[i]].filter((w) => (count.get(w) ?? 0) >= 2).length }))
    .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.l.id)
  let chorusIds = new Set(hits)
  if (chorusIds.size === 0 && ordered.length >= 4) {
    // 繰り返しがなければ、音数がいちばん近い2行をサビにする
    const m = ordered.map((l) => moraOf(l.text, tokenize))
    let best: [number, number] = [0, 1], d = Infinity
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) if (Math.abs(m[i] - m[j]) < d) { d = Math.abs(m[i] - m[j]); best = [i, j] }
    chorusIds = new Set([ordered[best[0]].id, ordered[best[1]].id])
  }
  const chorus = ordered.filter((l) => chorusIds.has(l.id))
  const rest = ordered.filter((l) => !chorusIds.has(l.id))
  const half = Math.ceil(rest.length / 2)
  return { verse1: rest.slice(0, half), chorus, verse2: rest.slice(half) }
}

/** 音数・対・韻を付ける。ponytail: 韻の下線は行末2文字で近似（読みと表記の字数は一致しない） */
export function annotate(lines: Line[], tokenize: Tokenize, context: Line[] = lines): Note[] {
  const readings = lines.map((l) => readingOf(l.text, tokenize))
  const m = readings.map(mora)
  const keys = readings.map(rhymeKey)
  // 韻は曲全体(context)で探す。対(音数が近い隣の行)は同じ枠の中だけで見る
  const ctxKeys = context.map((l) => rhymeKey(readingOf(l.text, tokenize)))
  return lines.map((l, i) => ({
    mora: m[i],
    pair: (i > 0 && Math.abs(m[i] - m[i - 1]) <= 1) || (i < lines.length - 1 && Math.abs(m[i] - m[i + 1]) <= 1),
    rhyme: keys[i].length === 2 && ctxKeys.filter((k) => k === keys[i]).length >= 2,
    tail: [...l.text].slice(-2).join(''),
  }))
}
