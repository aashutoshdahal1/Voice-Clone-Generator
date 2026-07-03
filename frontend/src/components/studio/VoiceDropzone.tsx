'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle2, BookmarkPlus } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { useCharactersStore } from '@/lib/store'
import type { SavedCharacter } from '@/types'

interface VoiceDropzoneProps {
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
}

function nanoid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
}

export function VoiceDropzone({ file, onFile, onClear }: VoiceDropzoneProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { add } = useCharactersStore()

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        onFile(accepted[0])
        setSaved(false)
        setName(accepted[0].name.replace(/\.[^.]+$/, ''))
      }
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.flac', '.ogg', '.m4a', '.aac'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  })

  function openDialog() {
    if (file) setName((prev) => prev || file.name.replace(/\.[^.]+$/, ''))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!file || !name.trim()) return
    setSaving(true)
    const reader = new FileReader()
    reader.onload = () => {
      const character: SavedCharacter = {
        id: nanoid(),
        name: name.trim(),
        description: description.trim() || undefined,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileDataUrl: reader.result as string,
        createdAt: Date.now(),
      }
      add(character)
      setSaving(false)
      setSaved(true)
      setDialogOpen(false)
      setDescription('')
    }
    reader.readAsDataURL(file)
  }

  if (file) {
    return (
      <>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {saved ? (
              <span className="text-xs text-primary font-medium px-2">Saved!</span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={openDialog}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Save as Character
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => { onClear(); setSaved(false) }} aria-label="Remove file">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogClose onClose={() => setDialogOpen(false)} />
            <DialogHeader>
              <DialogTitle>Save as Character</DialogTitle>
              <DialogDescription>
                Give this voice a name and optional description. It will be saved to your Characters library.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Character Name *</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deep Narrator, Corporate Voice…"
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Calm and professional, good for explainers…"
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{file.name} · {formatFileSize(file.size)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!name.trim() || saving}
                onClick={handleSave}
              >
                {saving ? 'Saving…' : 'Save Character'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200',
        isDragActive
          ? 'border-primary bg-primary/10 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
        isDragActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
      )}>
        <Upload className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop it here' : 'Drop audio or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">WAV, MP3, FLAC, OGG, M4A · Max 50MB</p>
      </div>
    </div>
  )
}
