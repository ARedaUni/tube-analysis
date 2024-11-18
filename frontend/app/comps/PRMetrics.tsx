'use client'
import { useRepository } from "@/hooks/useRepository"
import { Doughnut } from "react-chartjs-2"
import { Card } from "@/components/ui/card"
import { formatDuration, calculatePercentage } from "@/lib/utils"
import { GitMerge, GitPullRequest, Clock, Users } from "lucide-react"

export function PRMetrics() {
  const { repository } = useRepository()

  const prStatusData = {
    labels: ['Merged', 'Open', 'Closed'],
    datasets: [{
      data: [
        repository.merged_pr_count,
        repository.open_pr_count,
        repository.closed_pr_count
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ],
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    },
    cutout: '60%'
  }

  const metrics = [
    {
      title: "Merge Rate",
      value: `${calculatePercentage(repository.merged_pr_count, 
        repository.merged_pr_count + repository.closed_pr_count)}%`,
      icon: GitMerge,
      color: "text-green-500"
    },
    {
      title: "Open PRs",
      value: repository.open_pr_count,
      icon: GitPullRequest,
      color: "text-blue-500"
    },
    {
      title: "Avg Merge Time",
      value: formatDuration(repository.avg_pr_merge_time),
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Unique Contributors",
      value: repository.unique_pr_contributors,
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
        <h3 className="text-sm font-medium mb-3">PR Status Distribution</h3>
        <div className="h-[200px]">
          <Doughnut data={prStatusData} options={options} />
        </div>
      </div>
    </div>
  )
}