'use client'

import { useSettingsStore } from '@/lib/store'
import { LANGUAGES } from '@/lib/voices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { toast } from 'sonner'
import { RefreshCw, RotateCcw, Server, Sliders, Zap, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, update, reset } = useSettingsStore()
  const { isHealthy, checking, recheck } = useBackendHealth()

  const handleReset = () => {
    reset()
    toast.success('Settings reset to defaults.')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Backend */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Backend Connection</CardTitle>
          </div>
          <CardDescription>Configure the Pocket-TTS server connection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <SettingRow
            label="Backend Status"
            description={`Connected to ${settings.backendUrl}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    checking && 'bg-amber-400 animate-pulse',
                    !checking && isHealthy && 'bg-emerald-400',
                    !checking && !isHealthy && 'bg-red-400'
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {checking ? 'Checking…' : isHealthy ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={recheck} aria-label="Recheck">
                <RefreshCw className={cn('w-3.5 h-3.5', checking && 'animate-spin')} />
              </Button>
            </div>
          </SettingRow>

          <Separator />

          <SettingRow label="Backend URL" description="The Pocket-TTS server address.">
            <input
              className="flex h-8 w-52 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={settings.backendUrl}
              onChange={(e) => update({ backendUrl: e.target.value })}
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Generation defaults */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Generation Defaults</CardTitle>
          </div>
          <CardDescription>Default parameters applied to new generations.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow label="Default Language" description="Model variant to use.">
            <Select
              value={settings.language}
              onValueChange={(v) => update({ language: v as any })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.flag} {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <Separator />

          <SettingRow
            label="Temperature"
            description="Expressiveness vs consistency."
          >
            <div className="flex items-center gap-3 w-48">
              <Slider
                value={[settings.temperature]}
                min={0.1}
                max={1.5}
                step={0.05}
                onValueChange={([v]) => update({ temperature: v })}
                className="flex-1"
              />
              <Badge variant="secondary" className="tabular-nums text-xs w-10 justify-center">
                {settings.temperature.toFixed(2)}
              </Badge>
            </div>
          </SettingRow>

          <Separator />

          <SettingRow
            label="Decode Steps"
            description="Quality vs speed tradeoff."
          >
            <div className="flex items-center gap-3 w-48">
              <Slider
                value={[settings.lsdDecodeSteps]}
                min={1}
                max={8}
                step={1}
                onValueChange={([v]) => update({ lsdDecodeSteps: v })}
                className="flex-1"
              />
              <Badge variant="secondary" className="tabular-nums text-xs w-10 justify-center">
                {settings.lsdDecodeSteps}
              </Badge>
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Playback */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Playback</CardTitle>
          </div>
          <CardDescription>Audio playback preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="Auto-play"
            description="Automatically play audio when generation starts streaming."
          >
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={(v) => update({ autoPlay: v })}
            />
          </SettingRow>

          <Separator />

          <SettingRow
            label="Streaming Mode"
            description="Play audio while it's still generating."
          >
            <Switch
              checked={settings.streamingEnabled}
              onCheckedChange={(v) => update({ streamingEnabled: v })}
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
