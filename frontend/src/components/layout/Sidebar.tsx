'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mic2,
  History,
  Settings,
  Library,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { StatusDot } from './StatusDot'

const NAV_ITEMS = [
  { href: '/studio', label: 'Studio', icon: Mic2, description: 'Generate speech' },
  { href: '/voices', label: 'Voices', icon: Library, description: 'Browse voices' },
  { href: '/history', label: 'History', icon: History, description: 'Past generations' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Configure app' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
          isOpen ? 'w-56' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', !isOpen && 'justify-center px-0')}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold leading-none">Pocket TTS</p>
              <p className="text-xs text-muted-foreground mt-0.5">Studio</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            if (!isOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'w-full h-10',
                          isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-10 font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Status */}
        <div className={cn('px-4 py-4 border-t border-border', !isOpen && 'px-2 flex justify-center')}>
          {isOpen ? (
            <div className="flex items-center gap-2">
              <StatusDot />
              <span className="text-xs text-muted-foreground">Backend status</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <StatusDot />
              </TooltipTrigger>
              <TooltipContent side="right">Backend status</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
