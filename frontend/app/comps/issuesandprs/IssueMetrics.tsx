'use client'
import { useRepository } from "@/hooks/useRepository"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Card } from "@/components/ui/card"
import { formatDuration, calculatePercentage } from "@/lib/utils"
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users } from "lucide-react"
import { fetchRepositoryMetrics } from "@/services/api"
import { useQuery } from "@tanstack/react-query"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function IssueMetrics() {
  const { repository } = useRepository()

  const { data: metric = {}, isLoading, error } = useQuery({
    queryKey: ['metrics', repository?.id],
    queryFn: () => fetchRepositoryMetrics(repository?.id),
    enabled: !!repository?.id,
  })

  const issueAgeData = {
    labels: ['<1 day', '1-7 days', '1-4 weeks', '>1 month'],
    datasets: [{
      label: 'Open Issues by Age',
      data: repository.issue_age_distribution || [0, 0, 0, 0],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ],
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Issues'
        }
      }
    }
  }

  const metrics = [
    {
      title: "Open Issues",
      value: repository.open_issues_count,
      icon: AlertCircle,
      color: "text-yellow-500"
    },
    {
      title: "Closed Issues",
      value: repository.closed_issues_count,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "Avg Resolution Time",
      value: `${Math.round(parseFloat(repository.avg_issue_close_time?.split(' ')[0]))}h`,
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Resolution Rate",
      value: `${calculatePercentage(repository.closed_issues_count, 
        repository.closed_issues_count + repository.open_issues_count)}%`,
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Active Reviewers",
      value: metric.reviews?.active_reviewers_count || 0,
      icon: Users,
      color: "text-red-500",
      bgColor: "text-red-500"
    }, {
      title: "Avg Review Time",
      value: formatDuration(metric.reviews?.avg_review_time || 0),
      icon: Clock,
      color: "text-pink-500",
      bgColor: "text-pink-500"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-4">
            <div className="flex items-center space-x-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-sm font-medium">{metric.title}</span>
            </div>
            <div className="mt-3 text-2xl font-bold">{metric.value}</div>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Issue Age Distribution</h3>
        <Bar data={issueAgeData} options={options} />
      </div>
    </div>
  )
}