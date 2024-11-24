'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchHealthAndQuality } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useRepository } from '@/hooks/useRepository'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import RepositorySelector from '../comps/RepositorySelector'
import GitHubHealthMeter from '../comps/GithubHealthMeter'

export default function AnalyticsPage() {
  const { repository } = useRepository()
  const { data, isLoading, error } = useQuery({
    queryKey: ['healthAndQuality', repository?.id],
    queryFn: () => fetchHealthAndQuality(repository?.id),
    enabled: !!repository?.id,
  })

  if (!repository) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-3/4 mb-8" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load analytics data. Please try again later or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { community_health, timeline_data, contributors } = data || {}

  const ActivityTimelineSkeleton = () => (
    <div className="h-[400px] w-full bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 flex items-end justify-around p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-[7%] bg-gray-300 animate-pulse" style={{ height: `${Math.random() * 70 + 30}%` }} />
        ))}
      </div>
      <div className="absolute left-0 bottom-0 h-[1px] w-full bg-gray-300" />
      <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-300" />
    </div>
  )

  const TopContributorsSkeleton = () => (
    <div className="h-[400px] w-full bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 flex flex-col justify-around p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center ">
            <Skeleton className="h-6 w-24 mr-4 animate-pulse bg-gray-300" />
            <Skeleton className="h-6 flex-grow animate-pulse bg-blue-300" style={{ maxWidth: `${Math.random() * 50 + 50}%` }} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Repository Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <RepositorySelector />
        </div>
      </div>
      
      {/* Community Health */}
      <Card>
        <CardHeader>
          <CardTitle>Community Health</CardTitle>
        </CardHeader>
        {repository && (
          <div className="mb-3">
            <GitHubHealthMeter
              positivePercentage={repository.positive_comment_percentage}
              negativePercentage={repository.negative_comment_percentage}
              isLoading={isLoading}
            />
          </div>
        )}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full animate-pulse bg-gray-300" />
                ))
              : community_health &&
                Object.entries(community_health).map(([key, value]) => (
                  <Card key={key} className={`bg-gradient-to-br ${value ? 'from-green-50 to-green-100 dark:from-green-900 dark:to-green-800' : 'from-red-50 to-red-100 dark:from-red-900 dark:to-red-800'}`}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                      <p className="font-semibold mb-2 text-sm">{key.replace(/_/g, ' ')}</p>
                      {value ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      )}
                    </CardContent>
                  </Card>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline and Top Contributors */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Activity Timeline */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <ActivityTimelineSkeleton />
            ) : timeline_data?.dates?.length > 0 ? (
              <ChartContainer
                config={{
                  issues_opened: { label: 'Issues Opened', color: 'hsl(var(--chart-1))' },
                  issues_closed: { label: 'Issues Closed', color: 'hsl(var(--chart-2))' },
                  prs_opened: { label: 'PRs Opened', color: 'hsl(var(--chart-3))' },
                  prs_merged: { label: 'PRs Merged', color: 'hsl(var(--chart-4))' },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeline_data.dates.map((date: string, idx: number) => ({
                      date,
                      issues_opened: timeline_data.issues_opened[idx],
                      issues_closed: timeline_data.issues_closed[idx],
                      prs_opened: timeline_data.prs_opened[idx],
                      prs_merged: timeline_data.prs_merged[idx],
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIssuesOpened" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-issues_opened)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-issues_opened)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIssuesClosed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-issues_closed)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-issues_closed)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPRsOpened" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-prs_opened)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-prs_opened)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPRsMerged" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-prs_merged)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-prs_merged)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area type="monotone" dataKey="issues_opened" stroke="var(--color-issues_opened)" fillOpacity={1} fill="url(#colorIssuesOpened)" />
                    <Area type="monotone" dataKey="issues_closed" stroke="var(--color-issues_closed)" fillOpacity={1} fill="url(#colorIssuesClosed)" />
                    <Area type="monotone" dataKey="prs_opened" stroke="var(--color-prs_opened)" fillOpacity={1} fill="url(#colorPRsOpened)" />
                    <Area type="monotone" dataKey="prs_merged" stroke="var(--color-prs_merged)" fillOpacity={1} fill="url(#colorPRsMerged)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>
                  No timeline data is available for this repository.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <TopContributorsSkeleton />
            ) : contributors?.length > 0 ? (
              <ChartContainer
                config={{
                  contributions: { label: 'Contributions', color: 'hsl(var(--chart-1))' },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={contributors.slice(0, 5)} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="contributions" fill="var(--color-contributions)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>
                  No contributor data is available for this repository.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}