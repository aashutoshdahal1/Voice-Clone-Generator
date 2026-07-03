import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GenerationHistoryItem, AppSettings, Language, SavedCharacter } from '@/types'

interface HistoryStore {
  items: GenerationHistoryItem[]
  add: (item: GenerationHistoryItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => ({
          items: [item, ...state.items].slice(0, 50),
        })),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'tts-history',
      partialize: (state) => ({
        items: state.items.map(({ audioBlob: _blob, ...rest }) => rest),
      }),
    }
  )
)

const DEFAULT_SETTINGS: AppSettings = {
  backendUrl: 'http://localhost:8000',
  language: 'english',
  defaultVoice: 'alba',
  temperature: 0.7,
  lsdDecodeSteps: 1,
  autoPlay: true,
  streamingEnabled: true,
}

interface SettingsStore {
  settings: AppSettings
  update: (partial: Partial<AppSettings>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'tts-settings' }
  )
)

interface VoiceLibraryStore {
  selectedVoiceId: string
  customVoiceFile: File | null
  customVoiceUrl: string
  setSelectedVoiceId: (id: string) => void
  setCustomVoiceFile: (file: File | null) => void
  setCustomVoiceUrl: (url: string) => void
  clearCustomVoice: () => void
  getActiveVoiceMode: () => 'preset' | 'file' | 'url'
}

export const useVoiceLibraryStore = create<VoiceLibraryStore>()((set, get) => ({
  selectedVoiceId: 'alba',
  customVoiceFile: null,
  customVoiceUrl: '',
  setSelectedVoiceId: (id) =>
    set({ selectedVoiceId: id, customVoiceFile: null, customVoiceUrl: '' }),
  setCustomVoiceFile: (file) =>
    set({ customVoiceFile: file, customVoiceUrl: '', selectedVoiceId: '' }),
  setCustomVoiceUrl: (url) =>
    set({ customVoiceUrl: url, customVoiceFile: null, selectedVoiceId: '' }),
  clearCustomVoice: () =>
    set({ customVoiceFile: null, customVoiceUrl: '', selectedVoiceId: 'alba' }),
  getActiveVoiceMode: () => {
    const { customVoiceFile, customVoiceUrl } = get()
    if (customVoiceFile) return 'file'
    if (customVoiceUrl) return 'url'
    return 'preset'
  },
}))

interface GenerationStore {
  isGenerating: boolean
  status: string
  progress: number
  currentText: string
  setGenerating: (v: boolean) => void
  setStatus: (s: string) => void
  setProgress: (p: number) => void
  setCurrentText: (t: string) => void
  reset: () => void
}

export const useGenerationStore = create<GenerationStore>()((set) => ({
  isGenerating: false,
  status: '',
  progress: 0,
  currentText: '',
  setGenerating: (isGenerating) => set({ isGenerating }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCurrentText: (currentText) => set({ currentText }),
  reset: () => set({ isGenerating: false, status: '', progress: 0, currentText: '' }),
}))

interface CharactersStore {
  characters: SavedCharacter[]
  add: (character: SavedCharacter) => void
  remove: (id: string) => void
  update: (id: string, partial: Partial<Pick<SavedCharacter, 'name' | 'description'>>) => void
}

export const useCharactersStore = create<CharactersStore>()(
  persist(
    (set) => ({
      characters: [],
      add: (character) =>
        set((state) => ({ characters: [character, ...state.characters] })),
      remove: (id) =>
        set((state) => ({ characters: state.characters.filter((c) => c.id !== id) })),
      update: (id, partial) =>
        set((state) => ({
          characters: state.characters.map((c) => (c.id === id ? { ...c, ...partial } : c)),
        })),
    }),
    { name: 'tts-characters' }
  )
)

interface SidebarStore {
  isOpen: boolean
  toggle: () => void
  setOpen: (v: boolean) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    { name: 'tts-sidebar' }
  )
)
