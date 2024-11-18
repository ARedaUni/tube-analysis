'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, BarChart, Code, GitBranch, GitPullRequest, Home, Users } from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Overview",
    href: "/overview",
    icon: BarChart,
  },
  {
    title: "Issues & PRs",
    href: "/issues",
    icon: GitBranch,
  },
  {
    title: 'Code Analytics',
    href: '/code-analytics',
    icon: Code,
  },
  {
    title: 'Community',
    href: '/community-health',
    icon: Users,
  },
  {
    title: 'Performance',
    href: '/performance',
    icon: Activity,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <BarChart className="h-6 w-6" />
            <span>Repo Analytics</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {sidebarNavItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                    pathname === item.href ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : ""
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}