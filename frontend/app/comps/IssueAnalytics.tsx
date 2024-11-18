'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'




export default function IssueAnalytics({repository}) {
  const issueStatusData = [
    { name: 'Open Issues', value: repository.open_issues_count, color: 'hsl(var(--chart-1))' },
    { name: 'Closed Issues', value: repository.closed_issues_count, color: 'hsl(var(--chart-2))' },
  ]
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Issue Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={{}} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueStatusData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value">
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-800">
                <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-300" />
              </div>
              <span className="text-2xl font-medium text-center text-red-700 dark:text-red-300">Open Issues</span>
              <span className="text-5xl font-bold text-red-500 dark:text-red-400">{repository.open_issues_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-800">
                <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-300" />
              </div>
              <span className="text-2xl font-medium text-center text-green-700 dark:text-green-300">Closed Issues</span>
              <span className="text-5xl font-bold text-green-500 dark:text-green-400">{repository.closed_issues_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-800">
                <Clock className="w-16 h-16 text-blue-500 dark:text-blue-300" />
              </div>
              <span className="text-2xl font-medium text-center text-blue-700 dark:text-blue-300">Avg. Issue Close Time</span>
              <span className="text-5xl font-bold text-blue-500 dark:text-blue-400">
                {Math.round(parseFloat(repository.avg_issue_close_time.split(' ')[0]))}
              </span>
              <span className="text-xl font-medium text-blue-600 dark:text-blue-300">days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}