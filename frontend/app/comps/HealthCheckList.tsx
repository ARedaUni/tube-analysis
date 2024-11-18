'use client'
import { useRepository } from "@/hooks/useRepository"
import { CheckCircle2, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function HealthChecklist() {
  const { repository } = useRepository()
  
  const healthItems = [
    {
      label: 'Contributing Guidelines',
      status: repository.contributing_guidelines,
      description: 'Guidelines for contributing to the project'
    },
    {
      label: 'Code of Conduct',
      status: repository.code_of_conduct,
      description: 'Standards for community behavior'
    },
    {
      label: 'Issue Templates',
      status: repository.issue_template,
      description: 'Templates for creating issues'
    },
    {
      label: 'PR Templates',
      status: repository.pr_template,
      description: 'Templates for creating pull requests'
    }
  ]

  const healthScore = (healthItems.filter(item => item.status).length / healthItems.length) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Health Score</span>
          <span className="text-sm text-muted-foreground">{healthScore}%</span>
        </div>
        <Progress value={healthScore} />
      </div>
      
      <div className="space-y-4">
        {healthItems.map(item => (
          <div key={item.label} className="flex items-start space-x-3">
            {item.status ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div>
              <h4 className="font-medium">{item.label}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}