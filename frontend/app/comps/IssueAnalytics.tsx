'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useRepository } from '@/hooks/useRepository'

const CustomBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value))

  return (
    <div className="flex flex-col space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-24 text-sm text-muted-foreground">{item.name}</div>
          <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-right">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function IssueAnalytics() {
  const { repository } = useRepository()
  const issueStatusData = [
    { name: 'Open Issues', value: repository.open_issues_count, color: 'hsl(var(--chart-1))' },
    { name: 'Closed Issues', value: repository.closed_issues_count, color: 'hsl(var(--chart-2))' },
  ]
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Issue Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <CustomBarChart data={issueStatusData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Open Issues"
          value={repository.open_issues_count}
          icon={AlertCircle}
          gradientFrom="from-red-500/10"
          gradientTo="to-orange-500/10"
          textColor="text-red-500"
        />
        <StatCard
          title="Closed Issues"
          value={repository.closed_issues_count}
          icon={CheckCircle}
          gradientFrom="from-green-500/10"
          gradientTo="to-emerald-500/10"
          textColor="text-green-500"
        />
        <StatCard
          title="Avg. Issue Close Time"
          value={Math.round(parseFloat(repository.avg_issue_close_time?.split(' ')[0]))}
          icon={Clock}
          gradientFrom="from-blue-500/10"
          gradientTo="to-cyan-500/10"
          textColor="text-blue-500"
          unit="days"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, gradientFrom, gradientTo, textColor, unit }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group`}>
      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2 sm:mb-3 ${textColor}`} strokeWidth={1.5} />
      <span className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground text-center">{title}</span>
      <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} mt-1`}>{value}</span>
      {unit && <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">{unit}</span>}
    </div>
  )
}