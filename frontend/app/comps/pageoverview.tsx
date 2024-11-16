'use client'
import React from 'react'
import { Star, GitFork, AlertCircle, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RepositoryOverviewProps {
  name: string
  owner: string
  stars: number
  forks: number
  openIssuesCount: number
  closedIssuesCount: number
  mergedPrCount: number
  unmergedPrCount: number
  positiveCommentPercentage: number
  negativeCommentPercentage: number
  neutralCommentPercentage: number
  starHistory: { date: string; stars: number }[]
}

export default function RepositoryOverviewCard({
  name,
  owner,
  stars,
  forks,
  openIssuesCount,
  closedIssuesCount,
  mergedPrCount,
  unmergedPrCount,
  positiveCommentPercentage,
  negativeCommentPercentage,
  neutralCommentPercentage,
  starHistory
}: RepositoryOverviewProps) {
  const chartData = {
    labels: starHistory.map(item => item.date),
    datasets: [
      {
        label: 'Stars',
        data: starHistory.map(item => item.stars),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{owner}/{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-xl font-semibold">{stars}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitFork className="h-5 w-5 text-blue-500" />
            <span className="text-xl font-semibold">{forks}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-xl font-semibold">{openIssuesCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-xl font-semibold">{closedIssuesCount}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">Merged PRs</Badge>
            <span className="text-xl font-semibold">{mergedPrCount}</span>
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">Unmerged PRs</Badge>
            <span className="text-xl font-semibold">{unmergedPrCount}</span>
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className="mb-2">Comment Sentiment</Badge>
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <span>{positiveCommentPercentage.toFixed(1)}%</span>
            <ThumbsDown className="h-5 w-5 text-red-500 ml-4" />
            <span>{negativeCommentPercentage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className="mb-2">Star History</Badge>
          <div className="h-16">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}