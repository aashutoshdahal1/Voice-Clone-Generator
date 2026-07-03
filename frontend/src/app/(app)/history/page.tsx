'use client'

import { useState } from 'react'
import { useHistoryStore } from '@/lib/store'
import { AudioPlayer } from '@/components/studio/AudioPlayer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn, formatRelativeTime, truncateText, downloadBlob } from '@/lib/utils'
import { History, Trash2, Download, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function HistoryPage() {
  const { items, remove, clear } = useHistoryStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = items.filter(
    (i) =>
      i.text.toLowerCase().includes(search.toLowerCase()) ||
      i.voiceName.toLowerCase().includes(search.toLowerCase())
  )

  const handleClearAll = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clear()
      toast.success('History cleared.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
        <History className="w-16 h-16 opacity-20" />
        <p className="text-xl font-medium">No history yet</p>
        <p className="text-sm text-center max-w-sm">
          Generate some speech in the Studio and your creations will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Badge variant="secondary">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive hover:text-destructive gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No results for "{search}"
          </p>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Voice avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {item.voiceName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {truncateText(item.text, 100)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {item.voiceName}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.language}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.generatedAt)}
                        </span>
                        {item.speedRatio && (
                          <Badge variant="success" className="text-xs">
                            {item.speedRatio}× real-time
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          const blob = item.audioBlob
                          if (blob) {
                            downloadBlob(blob, `tts-${item.id}.wav`)
                          } else {
                            const a = document.createElement('a')
                            a.href = item.audioUrl
                            a.download = `tts-${item.id}.wav`
                            a.click()
                          }
                        }}
                        aria-label="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-0">
                    <Separator className="mb-4" />

                    {/* Full text */}
                    {item.text.length > 100 && (
                      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap leading-relaxed">
                        {item.text}
                      </p>
                    )}

                    <AudioPlayer
                      audioUrl={item.audioUrl}
                      audioBlob={item.audioBlob}
                      stats={{
                        timeToFirstAudio: item.timeToFirstAudio,
                        totalTime: item.totalTime,
                        speedRatio: item.speedRatio,
                      }}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
