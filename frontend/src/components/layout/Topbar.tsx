'use client'

import { usePathname } from 'next/navigation'
import { Moon, Sun, Mic2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/studio': { title: 'Studio', description: 'Generate speech from text' },
  '/voices': { title: 'Voice Library', description: 'Browse and manage voices' },
  '/history': { title: 'History', description: 'Your past generations' },
  '/settings': { title: 'Settings', description: 'Configure your workspace' },
}

export function Topbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const page = PAGE_TITLES[pathname] ?? { title: 'Pocket TTS', description: '' }

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{page.title}</h1>
          {page.description && (
            <p className="text-xs text-muted-foreground">{page.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}
