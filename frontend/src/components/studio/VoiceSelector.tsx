'use client'

import { useState } from 'react'
import { useVoiceLibraryStore, useCharactersStore } from '@/lib/store'
import { PREDEFINED_VOICES } from '@/lib/voices'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoiceDropzone } from './VoiceDropzone'
import { User, Link2, Upload, Search, Check, Mic } from 'lucide-react'

function Input_({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export function VoiceSelector() {
  const {
    selectedVoiceId,
    customVoiceFile,
    customVoiceUrl,
    setSelectedVoiceId,
    setCustomVoiceUrl,
    setCustomVoiceFile,
  } = useVoiceLibraryStore()
  const { characters } = useCharactersStore()

  const [search, setSearch] = useState('')

  const filtered = PREDEFINED_VOICES.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.language.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, typeof PREDEFINED_VOICES>>((acc, voice) => {
    const lang = voice.language
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(voice)
    return acc
  }, {})

  const activeTab = customVoiceFile ? 'upload' : customVoiceUrl ? 'url' : 'preset'

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Voice</span>

      <Tabs defaultValue={activeTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="preset" className="gap-1.5 text-xs">
            <User className="w-3.5 h-3.5" /> Preset
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5 text-xs">
            <Link2 className="w-3.5 h-3.5" /> URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preset" className="mt-3">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input_
              placeholder="Search voices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {Object.entries(grouped).map(([lang, voices]) => (
              <div key={lang}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {lang}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {voices.map((voice) => {
                    const isSelected = selectedVoiceId === voice.id
                    return (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all',
                          'border hover:border-primary/50 hover:bg-accent',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-transparent bg-secondary/50 text-foreground'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                          )}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <span className="font-medium truncate">{voice.name}</span>
                        {voice.gender && (
                          <Badge variant="secondary" className="ml-auto text-xs py-0 px-1 shrink-0">
                            {voice.gender === 'female' ? 'F' : 'M'}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Enter a Hugging Face or HTTP URL to a voice audio file.
            </p>
            <Input_
              placeholder="hf://kyutai/tts-voices/..."
              value={customVoiceUrl}
              onChange={(e) => setCustomVoiceUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Supports: <code className="text-primary">hf://</code>,{' '}
              <code className="text-primary">http://</code>,{' '}
              <code className="text-primary">https://</code>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-3 space-y-3">
          <VoiceDropzone
            file={customVoiceFile}
            onFile={setCustomVoiceFile}
            onClear={() => setCustomVoiceFile(null)}
          />

          {characters.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Saved Characters
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      fetch(char.fileDataUrl)
                        .then((r) => r.blob())
                        .then((blob) => {
                          const file = new File([blob], char.fileName, { type: char.fileType })
                          setCustomVoiceFile(file)
                        })
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all',
                      'border hover:border-primary/50 hover:bg-accent',
                      customVoiceFile?.name === char.fileName
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent bg-secondary/50 text-foreground'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {char.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{char.name}</p>
                      {char.description && (
                        <p className="text-xs text-muted-foreground truncate">{char.description}</p>
                      )}
                    </div>
                    <Mic className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
