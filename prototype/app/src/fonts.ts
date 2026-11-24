import type { FontKey } from './store'

/** 入力欄の書体。Apple 端末に入っている書体を名前で指定する（Web フォントの追加ダウンロードなし）。
 *  Apple 以外の端末では、後ろに並べた代替書体になる */
export const FONTS: Record<FontKey, { label: string; family: string }> = {
  rounded: { label: '丸ゴシック（アプリの書体）', family: '"M PLUS Rounded 1c", sans-serif' },
  system: { label: 'システム標準（Apple 標準）', family: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif' },
  gothic: { label: 'ゴシック体（ヒラギノ角ゴ）', family: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif' },
  mincho: { label: '明朝体（ヒラギノ明朝）', family: '"Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", "Noto Serif JP", serif' },
}
