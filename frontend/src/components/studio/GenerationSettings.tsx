'use client'

import { useSettingsStore } from '@/lib/store'
import { LANGUAGES } from '@/lib/voices'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

export function GenerationSettings() {
  const { settings, update } = useSettingsStore()

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Language */}
        <div className="space-y-2">
          <Label className="text-sm">Language & Model</Label>
          <Select
            value={settings.language}
            onValueChange={(v) => update({ language: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm">Temperature</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48">
                  Higher values produce more varied, expressive speech. Lower values are more
                  consistent.
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant="secondary" className="tabular-nums text-xs">
              {settings.temperature.toFixed(2)}
            </Badge>
          </div>
          <Slider
            value={[settings.temperature]}
            min={0.1}
            max={1.5}
            step={0.05}
            onValueChange={([v]) => update({ temperature: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Consistent</span>
            <span>Expressive</span>
          </div>
        </div>

        {/* LSD Decode Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm">Decode Steps</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48">
                  Number of diffusion steps. More steps = higher quality but slower generation.
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant="secondary" className="tabular-nums text-xs">
              {settings.lsdDecodeSteps}
            </Badge>
          </div>
          <Slider
            value={[settings.lsdDecodeSteps]}
            min={1}
            max={8}
            step={1}
            onValueChange={([v]) => update({ lsdDecodeSteps: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fastest</span>
            <span>Best quality</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
