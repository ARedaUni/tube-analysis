'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useRepository } from '@/hooks/useRepository'




export default function IssueAnalytics() {
  const {repository} = useRepository();
  const issueStatusData = [
    { name: 'Open Issues', value: repository.open_issues_count, color: 'hsl(var(--chart-1))' },
    { name: 'Closed Issues', value: repository.closed_issues_count, color: 'hsl(var(--chart-2))' },
  ]
  
  return (
    <div className="space-y-3 p-2 sm:space-y-4 sm:p-4">
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Issue Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={issueStatusData} 
                  layout="vertical"
                  margin={{ 
                    top: 5,
                    right: window.innerWidth < 640 ? 10 : 20,
                    bottom: 5,
                    left: window.innerWidth < 640 ? 80 : 100
                  }}
                >
                  <XAxis 
                    type="number"
                    tick={{ 
                      fontSize: window.innerWidth < 640 ? 10 : 12,
                      fill: 'hsl(var(--foreground))'
                    }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={window.innerWidth < 640 ? 70 : 90}
                    tick={{ 
                      fontSize: window.innerWidth < 640 ? 10 : 12,
                      fill: 'hsl(var(--foreground))'
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value">
                    {issueStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="overflow-hidden transition-all duration-200 hover:scale-102 hover:shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-red-100 dark:bg-red-800">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-red-500 dark:text-red-300" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-medium text-center text-red-700 dark:text-red-300">
                Open Issues
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500 dark:text-red-400">
                {repository.open_issues_count}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-200 hover:scale-102 hover:shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-green-100 dark:bg-green-800">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 dark:text-green-300" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-medium text-center text-green-700 dark:text-green-300">
                Closed Issues
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 dark:text-green-400">
                {repository.closed_issues_count}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-200 hover:scale-102 hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 xs:col-span-2 md:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-blue-100 dark:bg-blue-800">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 dark:text-blue-300" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-medium text-center text-blue-700 dark:text-blue-300">
                Avg. Issue Close Time
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-500 dark:text-blue-400">
                {Math.round(parseFloat(repository.avg_issue_close_time?.split(' ')[0]))}
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-medium text-blue-600 dark:text-blue-300">
                days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}