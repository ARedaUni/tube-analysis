import { Badge } from "@/components/ui/badge"

const recentIssues = [
  { title: 'Update dependencies', status: 'open', priority: 'high', assignee: 'Alice' },
  { title: 'Fix responsive layout', status: 'in progress', priority: 'medium', assignee: 'Bob' },
  { title: 'Improve error handling', status: 'open', priority: 'low', assignee: 'Charlie' },
  { title: 'Add unit tests', status: 'open', priority: 'high', assignee: 'Diana' },
  { title: 'Refactor authentication logic', status: 'in progress', priority: 'medium', assignee: 'Edward' },
]

export function IssueList() {
  return (
    <div className="space-y-8">
      {recentIssues.map((issue, index) => (
        <div key={index} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{issue.title}</p>
            <p className="text-sm text-muted-foreground">Assigned to {issue.assignee}</p>
          </div>
          <div className="ml-auto space-x-1">
            <Badge variant={issue.status === 'open' ? 'destructive' : 'default'}>
              {issue.status}
            </Badge>
            <Badge variant={issue.priority === 'high' ? 'destructive' : issue.priority === 'medium' ? 'default' : 'secondary'}>
              {issue.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}