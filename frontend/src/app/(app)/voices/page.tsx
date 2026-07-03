'use client'

import { useState } from 'react'
import { PREDEFINED_VOICES } from '@/lib/voices'
import { useVoiceLibraryStore, useCharactersStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { cn, formatFileSize } from '@/lib/utils'
import { Check, Search, User, Globe, Trash2, Pencil, BookmarkPlus, Mic } from 'lucide-react'
import type { SavedCharacter } from '@/types'

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="Search voices by name or language…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

const LANGUAGE_FILTERS = ['All', 'English', 'French', 'German', 'Italian', 'Spanish', 'Portuguese']
const GENDER_FILTERS = ['All', 'Male', 'Female']

function CharacterCard({ character }: { character: SavedCharacter }) {
  const { remove, update, characters } = useCharactersStore()
  const { setCustomVoiceFile } = useVoiceLibraryStore()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(character.name)
  const [description, setDescription] = useState(character.description ?? '')

  function handleUse() {
    fetch(character.fileDataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], character.fileName, { type: character.fileType })
        setCustomVoiceFile(file)
      })
  }

  function handleSaveEdit() {
    if (name.trim()) {
      update(character.id, { name: name.trim(), description: description.trim() || undefined })
      setEditOpen(false)
    }
  }

  const initials = character.name.slice(0, 2).toUpperCase()

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-violet-500/20 text-violet-400">
              {initials}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { setName(character.name); setDescription(character.description ?? ''); setEditOpen(true) }}
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label="Edit character"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => remove(character.id)}
                className="p-1 rounded hover:bg-destructive/10 transition-colors"
                aria-label="Delete character"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <p className="font-semibold text-sm">{character.name}</p>
            {character.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{character.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs gap-1">
              <Mic className="w-2.5 h-2.5" />
              Custom
            </Badge>
            <span className="text-xs text-muted-foreground">{formatFileSize(character.fileSize)}</span>
          </div>

          <Button
            className="w-full mt-3 h-7 text-xs"
            variant="outline"
            size="sm"
            onClick={handleUse}
          >
            Use in Studio
          </Button>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogClose onClose={() => setEditOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
            <DialogDescription>Update the name or description for this voice character.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!name.trim()} onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function VoicesPage() {
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [tab, setTab] = useState<'preset' | 'characters'>('preset')
  const { selectedVoiceId, setSelectedVoiceId } = useVoiceLibraryStore()
  const { characters } = useCharactersStore()

  const filtered = PREDEFINED_VOICES.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.language.toLowerCase().includes(search.toLowerCase())
    const matchLang = langFilter === 'All' || v.language === langFilter
    const matchGender =
      genderFilter === 'All' ||
      (genderFilter === 'Male' && v.gender === 'male') ||
      (genderFilter === 'Female' && v.gender === 'female')
    return matchSearch && matchLang && matchGender
  })

  const filteredChars = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b pb-0">
        {(['preset', 'characters'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'preset' ? 'Preset Voices' : `My Characters${characters.length ? ` (${characters.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} />
        {tab === 'preset' && (
          <>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGE_FILTERS.map((f) => (
                <Button key={f} variant={langFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setLangFilter(f)} className="h-8 text-xs">{f}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              {GENDER_FILTERS.map((f) => (
                <Button key={f} variant={genderFilter === f ? 'secondary' : 'ghost'} size="sm" onClick={() => setGenderFilter(f)} className="h-8 text-xs">{f}</Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preset voices */}
      {tab === 'preset' && (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} voice{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <User className="w-12 h-12 opacity-20" />
              <p className="text-lg font-medium">No voices found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((voice) => {
                const isSelected = selectedVoiceId === voice.id
                return (
                  <Card key={voice.id} onClick={() => setSelectedVoiceId(voice.id)} className={cn('cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-border/80')}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0', voice.gender === 'female' ? 'bg-pink-500/20 text-pink-400' : voice.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary text-secondary-foreground')}>
                          {voice.name.slice(0, 2).toUpperCase()}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="font-semibold text-sm">{voice.name}</p>
                        {voice.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{voice.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs gap-1"><Globe className="w-2.5 h-2.5" />{voice.language}</Badge>
                        {voice.gender && (
                          <Badge className={cn('text-xs', voice.gender === 'female' ? 'bg-pink-500/15 text-pink-400 border-pink-500/20' : 'bg-blue-500/15 text-blue-400 border-blue-500/20')} variant="outline">
                            {voice.gender === 'female' ? 'Female' : 'Male'}
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full mt-3 h-7 text-xs" variant={isSelected ? 'default' : 'outline'} size="sm" onClick={(e) => { e.stopPropagation(); setSelectedVoiceId(voice.id) }}>
                        {isSelected ? 'Selected' : 'Select Voice'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* My Characters */}
      {tab === 'characters' && (
        <>
          {filteredChars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <BookmarkPlus className="w-12 h-12 opacity-20" />
              <p className="text-lg font-medium">{characters.length === 0 ? 'No saved characters yet' : 'No matches'}</p>
              <p className="text-sm text-center max-w-xs">
                {characters.length === 0
                  ? 'Upload a voice file in the Studio and click "Save as Character" to build your library.'
                  : 'Try a different search term.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChars.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
