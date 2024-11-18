'use client'
import { useRepository } from "@/hooks/useRepository"
import { Card } from "@/components/ui/card"
import { MessageSquare, GitPullRequest, AlertCircle, Users } from "lucide-react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export function EngagementMetrics() {
  const { repository } = useRepository()

  const metrics = [
    {
      title: "Comment Sentiment",
      icon: MessageSquare,
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [
            repository.positive_comment_percentage,
            repository.neutral_comment_percentage,
            repository.negative_comment_percentage
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ]
        }]
      }
    },
    {
      title: "Issue Resolution",
      icon: AlertCircle,
      value: `${repository.issue_resolution_rate}%`,
      description: "Issues resolved within SLA"
    },
    {
      title: "PR Acceptance",
      icon: GitPullRequest,
      value: `${repository.pr_merge_rate}%`,
      description: "Pull requests merged"
    }
  ]

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    cutout: '70%'
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        {metrics.slice(1).map((metric) => (
          <Card key={metric.title} className="p-4">
            <div className="flex items-center space-x-2">
              <metric.icon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{metric.title}</h3>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Comment Sentiment Analysis</h3>
        <div className="h-[200px]">
          <Doughnut data={metrics[0].data} options={chartOptions} />
        </div>
      </Card>
    </div>
  )
}