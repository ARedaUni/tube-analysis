'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Card, CardContent } from '@/components/ui/card'
import { Star, GitFork, AlertCircle, CheckCircle, Clock, GitPullRequest, Calendar } from 'lucide-react'
import { useRepository } from '@/hooks/useRepository'
import LoadingSpinner from './LoadingSpinner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


interface RepositoryData {
  name: string
  stars: number
  forks: number
  open_issues: number
  closed_issues_count: number
  avg_issue_close_time: string
  avg_pr_merge_time: string
  created_at: string
  updated_at: string
  starHistory?: { date: string; stars: number }[]
}

export default function RepositoryOverview() {
  const { repository, isLoading, error } = useRepository()
  repository && console.log(repository)
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error loading repository: {error.message}</p>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">No repository selected.</p>
      </div>
    )
  }

  const starHistory = repository.starHistory || []

  const chartData = {
    labels: starHistory.map(item => item.date),
    datasets: [
      {
        label: 'Stars',
        data: starHistory.map(item => item.stars),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Star History',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return (
    <div className="space-y-4 p-2" key={repository.name}>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Stars */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{repository.stars.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Stars</p>
          </CardContent>
        </Card>

        {/* Forks */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <GitFork className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{repository.forks.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Forks</p>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{repository.open_issues.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Open Issues</p>
          </CardContent>
        </Card>

        {/* Closed Issues */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{repository.closed_issues_count.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Closed Issues</p>
          </CardContent>
        </Card>

        {/* Avg Issue Close Time */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{Math.round(parseFloat(repository.avg_issue_close_time?.split(' ')[0]))} days</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Issue Close Time</p>
          </CardContent>
        </Card>

        {/* Avg PR Merge Time */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <GitPullRequest className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{Math.round(parseFloat(repository.avg_pr_merge_time?.split(':')[0]))} hours</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Avg PR Merge Time</p>
          </CardContent>
        </Card>

        {/* Created At */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-teal-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{formatDate(repository.created_at)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>

        {/* Updated At */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mb-1 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{formatDate(repository.updated_at)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Star History Chart */}
      {starHistory.length > 0 && (
        <Card>
          <CardContent className="p-2 sm:p-4 lg:p-6">
            <Line 
              data={chartData} 
              options={{
                ...chartOptions,
                maintainAspectRatio: true,
                aspectRatio: window.innerWidth < 640 ? 1 : 2,
              }} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}