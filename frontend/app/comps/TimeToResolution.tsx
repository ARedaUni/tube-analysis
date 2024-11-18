'use client'
import { useRepository } from "@/hooks/useRepository"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDuration } from "@/lib/utils"

export function TimeToResolution() {
  const { repository } = useRepository()

  const metrics = [
    {
      label: 'Issues',
      time: repository.avg_issue_resolution_time,
      target: repository.target_issue_resolution_time,
      color: 'bg-red-500'
    },
    {
      label: 'Pull Requests',
      time: repository.avg_pr_resolution_time,
      target: repository.target_pr_resolution_time,
      color: 'bg-blue-500'
    },
    {
      label: 'Bug Fixes',
      time: repository.avg_bug_resolution_time,
      target: repository.target_bug_resolution_time,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="space-y-6">
      {metrics.map(metric => {
        const percentage = metric.target ? (metric.time / metric.target) * 100 : 0
        return (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{metric.label}</span>
              <span className="text-muted-foreground">
                {formatDuration(metric.time)} / {formatDuration(metric.target)}
              </span>
            </div>
            <Progress value={percentage} className={metric.color} />
          </div>
        )
      })}
      
      <Card className="p-4 mt-4">
        <h4 className="font-medium mb-2">SLA Compliance</h4>
        <div className="text-3xl font-bold">
          {repository.sla_compliance_rate}%
        </div>
        <p className="text-sm text-muted-foreground">
          of issues and PRs resolved within target time
        </p>
      </Card>
    </div>
  )
}