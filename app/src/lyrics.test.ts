import { describe, expect, test, beforeAll } from 'vitest'
import kuromoji from 'kuromoji'
import { annotate, layout, mora, moraOf, splitLines, type Line, type Tokenize } from './lyrics'

let tk: Tokenize
beforeAll(async () => {
  const t = await new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((ok, ng) =>
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((e, t) => (e ? ng(e) : ok(t))))
  tk = (s) => t.tokenize(s) as never
}, 60000)

const L = (id: string, text: string, date = '2026-11-16'): Line => ({ id, text, date })

describe('歌詞化ロジック', () => {
  test('改行と句読点で分ける', () => {
    expect(splitLines('帰り道、信号が青に\nなんでもない。ずっと！')).toEqual(['帰り道', '信号が青に', 'なんでもない', 'ずっと'])
  })
  test('モーラ数: 拗音は1拍、っ・ー・んも1拍', () => {
    expect(mora('キャット')).toBe(3)
    expect(mora('シャーベット')).toBe(5)
    expect(mora('ホンヤ')).toBe(3)
  })
  test('読みを取って数える', () => {
    expect(moraOf('ずっと残っていた', tk)).toBe(9)
  })
  test('行末の母音がそろう行に韻が付く', () => {
    const a = annotate([L('1', '変わるのを待っていた'), L('2', 'なんでもない時間が'), L('3', 'ずっと残っていた')], tk)
    expect(a.map((x) => x.rhyme)).toEqual([true, false, true])
  })
  test('韻は枠をまたいで探す', () => {
    const [a, b] = [L('1', 'ふたりで黙って待っていた'), L('2', 'ずっと覚えている気がした')]
    expect(annotate([a], tk, [a, b])[0].rhyme).toBe(true)
    expect(annotate([a], tk)[0].rhyme).toBe(false)
  })
  test('繰り返し出る言葉を含む行がサビになる', () => {
    const s = layout([L('1', '青い信号を待つ', '2026-11-01'), L('2', 'まだ歩けない', '2026-11-02'), L('3', '信号が変わる', '2026-11-03'), L('4', '夜が来る', '2026-11-04'), L('5', 'ひとりで帰る', '2026-11-05')], tk)
    expect(s.chorus.map((l) => l.id)).toEqual(['1', '3'])
    expect(s.verse1.length + s.verse2.length).toBe(3)
    expect(s.verse1[0].date <= s.verse2[0].date).toBe(true)
  })
})
