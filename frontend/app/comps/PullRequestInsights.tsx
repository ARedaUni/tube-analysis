'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Scatter, ScatterChart, CartesianGrid } from "recharts"
import { GitPullRequest, Clock, Calendar } from 'lucide-react'
import { fetchPullRequests } from '@/services/api'

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

export default function PullRequestInsights({ repositoryId }: PullRequestInsightsProps) {
  const { data: pullRequests, isLoading, error } = useQuery({
    queryKey: ['pullRequests', repositoryId],
    queryFn: () => fetchPullRequests(repositoryId),
    enabled: !!repositoryId,
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

  const scatterData = pullRequests
    .filter(pr => pr.merged && pr.merged_at)
    .map(pr => {
      const createdAt = new Date(pr.created_at).getTime();
      const mergedAt = new Date(pr.merged_at!).getTime();
      const responseTime = pr.response_time 
        ? new Date(`1970-01-01T${pr.response_time}Z`).getTime()
        : null;
      
      return {
        prNumber: pr.pr_number,
        title: pr.title,
        mergeTime: (mergedAt - createdAt) / (1000 * 60 * 60),
        responseTime: responseTime ? responseTime / (1000 * 60 * 60) : 0,
        size: pr.body?.length || 0,
      };
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PR Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {prStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PR Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                <GitPullRequest className="w-14 h-14 mb-4 text-purple-500" strokeWidth={1.5} />
                <span className="text-sm font-medium text-muted-foreground mb-2">Total PRs</span>
                <span className="text-5xl font-bold text-purple-500">{pullRequests.length}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Clock className="w-14 h-14 mb-4 text-blue-500" strokeWidth={1.5} />
                <span className="text-sm font-medium text-muted-foreground mb-2">Avg. Merge Time</span>
                <span className="text-5xl font-bold text-blue-500">{avgMergeTimeHours}h</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                <GitPullRequest className="w-14 h-14 mb-4 text-green-500" strokeWidth={1.5} />
                <span className="text-sm font-medium text-muted-foreground mb-2">Merge Rate</span>
                <span className="text-5xl font-bold text-green-500">
                  {Math.round((mergedPRs.length / pullRequests.length) * 100)}%
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Calendar className="w-14 h-14 mb-4 text-orange-500" strokeWidth={1.5} />
                <span className="text-sm font-medium text-muted-foreground mb-2">Open PRs</span>
                <span className="text-5xl font-bold text-orange-500">{openPRs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PR Response vs Merge Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  type="number"
                  dataKey="responseTime"
                  name="Response Time"
                  label={{ 
                    value: 'Response Time (hours)', 
                    position: 'bottom',
                    style: { fill: 'hsl(var(--foreground))' }
                  }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  type="number"
                  dataKey="mergeTime"
                  name="Merge Time"
                  label={{ 
                    value: 'Time to Merge (hours)', 
                    angle: -90, 
                    position: 'left',
                    style: { fill: 'hsl(var(--foreground))' }
                  }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <p className="font-medium">#{data.prNumber}</p>
                          <p className="text-sm">{data.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Response Time: {data.responseTime.toFixed(1)}h
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Merge Time: {data.mergeTime.toFixed(1)}h
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={scatterData}
                  fill="url(#colorfulGradient)"
                >
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${(index * 360) / scatterData.length}, 70%, 60%)`}
                    />
                  ))}
                </Scatter>
                <defs>
                  <linearGradient id="colorfulGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="50%" stopColor="hsl(var(--secondary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Each point represents a PR. Position shows relationship between initial response time and total time to merge.
            <br />
            Colors vary by PR order, and point sizes reflect PR description length.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}