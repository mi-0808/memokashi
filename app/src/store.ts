import { useEffect, useState } from 'react'
import type { Sections } from './lyrics'

export type Folder = { id: string; name: string }
export type Memo = { id: string; folderId: string; text: string; createdAt: string }
export type Shape = 'circle' | 'triangle' | 'square'
export type Song = {
  id: string; folderId: string; title: string; artist: string
  bg: string; shape: Shape; shapeColor: string
  sections: Sections; memoDates: string[]; createdAt: string
}
export type FontKey = 'rounded' | 'system' | 'gothic' | 'mincho'
export type Settings = { artist: string; dark: boolean; font: FontKey }
export type Data = { folders: Folder[]; memos: Memo[]; songs: Song[]; settings: Settings }

const KEY = 'memokashi:v1'
export const uid = () => Math.random().toString(36).slice(2, 10)

const initial = (): Data => ({
  folders: [{ id: uid(), name: 'はじめてのメモ' }], memos: [], songs: [],
  settings: { artist: '', dark: false, font: 'system' },
})

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const p = JSON.parse(raw); return { ...initial(), ...p, settings: { ...initial().settings, ...p.settings } } }
  } catch { /* 壊れたデータや保存禁止の環境では初期状態から始める */ }
  return initial()
}

export function useData(): [Data, (f: (d: Data) => Data) => void] {
  const [data, setData] = useState<Data>(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* 容量超過などは無視 */ }
  }, [data])
  return [data, (f) => setData(f)]
}
