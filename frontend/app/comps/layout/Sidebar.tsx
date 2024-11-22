'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BarChart , Search, GitBranch, Home, Users, Sun, Moon, LogIn, UserPlus, LogOut } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

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
    title: "Community",
    href: "/community-health",
    icon: Users,
  },
  {
    title: "Repository Grabber",
    href: "/fetch-repository",
    icon: Search,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('accessToken')

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push('/login')
  }

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Header */}
        <div className="flex h-[60px] items-center justify-between border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <BarChart className="h-6 w-6" />
            <span>Repo Analytics</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </Button>
        </div>

        {/* Navigation */}
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

        {/* Authentication Section */}
        <div className="mt-auto px-4 py-4">
          <Separator className="my-4" />
          {isLoggedIn ? (
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline" className="w-full justify-start mb-2" onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/register')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}