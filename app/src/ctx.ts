import { createContext } from 'react'
import type { Data } from './store'
import type { Sections, Tokenize } from './lyrics'

export type Screen =
  | { n: 'splash' } | { n: 'write' } | { n: 'library' } | { n: 'folders' } | { n: 'settings' }
  | { n: 'folder'; id: string }
  | { n: 'lyrics'; folderId: string; sections: Sections }
  | { n: 'cover'; folderId: string; sections: Sections; songId?: string }
  | { n: 'song'; id: string }

export type Ctx = {
  data: Data
  update: (f: (d: Data) => Data) => void
  tokenize: Tokenize
  ready: boolean
  go: (s: Screen) => void
  toast: (m: string) => void
}
export const AppCtx = createContext<Ctx>(null as never)
