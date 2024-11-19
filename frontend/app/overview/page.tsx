'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRepository } from '@/hooks/useRepository'
import RepositorySelector from '@/app/comps/RepositorySelector'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, AlertCircle, GitPullRequest, Code, Users, Clock, Calendar } from 'lucide-react'

// Helper function to convert duration to human-readable format
const formatDuration = (duration) => {
  if (!duration) return 'N/A'
  const parts = duration.split(':')
  if (parts.length >= 3) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseInt(parts[2])
    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`
  }
  return 'N/A'
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`transition-shadow duration-300 ${isHovered ? 'shadow-lg' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 text-${color}-500`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const LanguageBar = ({ languages }) => {
  const sortedLanguages = useMemo(() => {
    const totalLines = Object.values(languages).reduce((sum, lines) => sum + lines, 0)
    return Object.entries(languages)
      .map(([lang, lines]) => ({
        lang,
        lines,
        percentage: (lines / totalLines) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }, [languages])

  return (
    <>
      <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
        {sortedLanguages.map(({ lang, percentage }) => (
          <div
            key={lang}
            className="h-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: getLanguageColor(lang),
            }}
            title={`${lang}: ${percentage.toFixed(2)}%`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {sortedLanguages.map(({ lang, percentage }) => (
          <span key={lang} className="text-xs text-muted-foreground flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getLanguageColor(lang) }}
            ></div>
            {lang}: {percentage < 1 ? percentage.toFixed(2) : percentage.toFixed(1)}%
          </span>
        ))}
      </div>
    </>
  )
}

const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    // Add more languages and their colors as needed
  }
  return colors[language] || '#bbbbbb'
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function OverviewPage() {
  const { repository, isLoading, error } = useRepository()
  const [isVisible, setIsVisible] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error fetching repository: {error.message}</p>
      </div>
    )
  }

  if (!repository) {
    return null
  }

  const {
    name,
    owner,
    description,
    stars,
    forks,
    open_issues,
    contributors,
    languages,
    commit_count,
    created_at,
    updated_at,
    avg_issue_close_time,
    avg_pr_merge_time,
  } = repository

  setTimeout(() => setIsVisible(true), 100)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-3xl font-bold tracking-tight">Repository Overview</h2>
        <RepositorySelector />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{capitalizeFirstLetter(name)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{description}</p>
            <p className="mt-2 text-sm text-muted-foreground">Owned by: {capitalizeFirstLetter(owner)}</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Created:</strong> {new Date(created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Last Updated:</strong> {new Date(updated_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Avg. Issue Close Time:</strong> {formatDuration(avg_issue_close_time)}
              </div>
              <div>
                <strong>Avg. PR Merge Time:</strong> {formatDuration(avg_pr_merge_time)}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard title="Stars" value={stars.toLocaleString()} icon={Star} color="yellow" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard title="Forks" value={forks.toLocaleString()} icon={GitFork} color="blue" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard title="Open Issues" value={open_issues.toLocaleString()} icon={AlertCircle} color="red" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatCard title="Contributors" value={contributors.length.toLocaleString()} icon={Users} color="green" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageBar languages={languages} />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Total Commits" value={commit_count.toLocaleString()} icon={Code} color="purple" />
              <StatCard 
                title="Avg. Issue Close Time" 
                value={formatDuration(avg_issue_close_time)} 
                icon={Clock} 
                color="orange"
              />
              <StatCard 
                title="Avg. PR Merge Time" 
                value={formatDuration(avg_pr_merge_time)} 
                icon={GitPullRequest} 
                color="indigo"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[150px] w-full" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full" />
        ))}
      </div>
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}
