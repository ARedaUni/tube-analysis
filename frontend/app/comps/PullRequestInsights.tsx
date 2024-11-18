'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Scatter, ScatterChart, CartesianGrid } from "recharts"
import { GitPullRequest, Clock, Calendar } from 'lucide-react'
import { fetchPullRequests } from '@/services/api'
import { useRepository } from '@/hooks/useRepository'

interface PullRequest {
  id: number
  repository: number
  pr_number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  merged: boolean
  created_at: string
  merged_at: string | null
  response_time: string | null
}

interface PullRequestInsightsProps {
  repositoryId: number
}

export default function PullRequestInsights() {
  const {repository} = useRepository();
  const { data: pullRequests, isLoading, error } = useQuery({
    queryKey: ['pullRequests', repository.id],
    queryFn: () => fetchPullRequests(repository.id),
    enabled: !!repository.id,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading pull requests</div>
  if (!pullRequests) return null

  const mergedPRs = pullRequests.filter(pr => pr.merged)
  const openPRs = pullRequests.filter(pr => pr.state === 'open')
  
  const prStatusData = [
    { name: 'Merged', value: mergedPRs.length, color: 'hsl(var(--chart-1))' },
    { name: 'Open', value: openPRs.length, color: 'hsl(var(--chart-2))' },
  ]

  const avgMergeTime = mergedPRs.reduce((sum, pr) => {
    if (pr.merged_at) {
      const mergeTime = new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()
      return sum + mergeTime
    }
    return sum
  }, 0) / mergedPRs.length

  const avgMergeTimeHours = Math.round(avgMergeTime / (1000 * 60 * 60))

  const prAgeData = pullRequests.map(pr => {
    const age = new Date().getTime() - new Date(pr.created_at).getTime()
    return { number: pr.pr_number, age: Math.round(age / (1000 * 60 * 60 * 24)) }
  }).sort((a, b) => b.age - a.age).slice(0, 10)

  const prActivityByMonth = pullRequests.reduce((acc: Record<string, number>, pr) => {
    const month = new Date(pr.created_at).toLocaleString('default', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const prActivityData = Object.entries(prActivityByMonth)
    .map(([month, count]) => ({ month, count }))
    .slice(-6)

  const timelineData = pullRequests
    .slice(-10)
    .map(pr => ({
      title: pr.title.length > 50 ? pr.title.substring(0, 50) + '...' : pr.title,
      start: new Date(pr.created_at).getTime(),
      end: pr.merged_at ? new Date(pr.merged_at).getTime() : new Date().getTime(),
      state: pr.state,
      merged: pr.merged,
      pr_number: pr.pr_number
    }))
    .sort((a, b) => b.start - a.start)

  return (
    <div className="space-y-3 p-2 sm:space-y-4 sm:p-4">
      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">PR Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-102">
              <GitPullRequest className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mb-1 sm:mb-2 text-purple-500" strokeWidth={1.5} />
              <span className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Total PRs</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-500">{pullRequests?.length}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-102">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mb-1 sm:mb-2 text-blue-500" strokeWidth={1.5} />
              <span className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Avg. Merge Time</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-500">{avgMergeTimeHours}h</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-102">
              <GitPullRequest className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mb-1 sm:mb-2 text-green-500" strokeWidth={1.5} />
              <span className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Merge Rate</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-500">
                {Math.round((mergedPRs?.length / pullRequests?.length) * 100)}%
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-102">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mb-1 sm:mb-2 text-orange-500" strokeWidth={1.5} />
              <span className="text-2xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Open PRs</span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-500">{openPRs?.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">PR Status</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 640 ? 50 : window.innerWidth < 1024 ? 70 : 80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {prStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{
                      fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}