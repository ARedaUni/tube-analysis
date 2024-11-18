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
import { ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function ReviewAnalytics() {
  const { repository } = useRepository()

  const reviewData = {
    labels: ['0-1', '2-3', '4-5', '6+'],
    datasets: [{
      label: 'Number of Reviews per PR',
      data: repository.reviews_per_pr_distribution || [0, 0, 0, 0],
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
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
          text: 'Number of PRs'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Number of Reviews'
        }
      }
    }
  }

  const metrics = [
    {
      title: "Approval Rate",
      value: `${calculatePercentage(repository.approved_prs, repository.total_reviewed_prs)}%`,
      icon: ThumbsUp,
      color: "text-green-500"
    },
    {
      title: "Change Requests",
      value: `${calculatePercentage(repository.change_requested_prs, repository.total_reviewed_prs)}%`,
      icon: ThumbsDown,
      color: "text-red-500"
    },
    {
      title: "Avg Review Time",
      value: formatDuration(repository.avg_review_time),
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Active Reviewers",
      value: repository.active_reviewers_count,
      icon: Users,
      color: "text-purple-500"
    }
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
        <h3 className="text-sm font-medium mb-3">Reviews Distribution</h3>
        <Bar data={reviewData} options={options} />
      </div>

      {repository.top_reviewers && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Top Reviewers</h3>
          <div className="space-y-2">
            {repository.top_reviewers.map((reviewer: any) => (
              <div key={reviewer.username} className="flex justify-between items-center">
                <span>{reviewer.username}</span>
                <span className="text-muted-foreground">{reviewer.review_count} reviews</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}