'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchContributors } from '@/services/api'
import { useRepository } from '@/hooks/useRepository'

export default function ContributorInsights() {
  const { repository } = useRepository()

  // Fetch contributors using React Query
  const { data: contributors = [], isLoading, error } = useQuery({
    queryKey: ['contributors', repository?.id],
    queryFn: () => fetchContributors(repository?.id),
    enabled: !!repository?.id, // Only fetch if repository ID exists
  })

  // Prepare chart data
  const chartData = contributors.map((contributor: any) => ({
    name: contributor.username,
    value: contributor.total_contributions,
    color: 'hsl(var(--chart-1))',
  }))

  if (isLoading) {
    return <div>Loading contributors...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading contributors.</div>
  }

  return (
    <div className="space-y-4 p-2 sm:space-y-6 sm:p-4">
      {/* Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Contributions Chart</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 50,
                }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: 'hsl(var(--foreground))',
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: 'hsl(var(--foreground))',
                  }}
                />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Total Contributions</TableHead>
                <TableHead className="hidden md:table-cell">Repositories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((contributor: any) => (
                <TableRow key={contributor.id}>
                  <TableCell className="font-medium">{contributor.username}</TableCell>
                  <TableCell>{contributor.total_contributions}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contributor.repositories.join(', ')} {/* Display repository IDs */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
