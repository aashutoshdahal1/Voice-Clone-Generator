import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { BackendDownBanner } from '@/components/layout/BackendDownBanner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <BackendDownBanner />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
