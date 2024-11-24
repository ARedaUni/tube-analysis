'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bar, BarChart, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchContributors } from '@/services/api'
import { useRepository } from '@/hooks/useRepository'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import LoadingSpinner  from "@/app/comps/LoadingSpinner"

export default function ContributorInsights() {
  const { repository } = useRepository()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null)

  const { data: contributors = [], isLoading, error } = useQuery({
    queryKey: ['contributors', repository?.id],
    queryFn: () => fetchContributors(repository?.id),
    enabled: !!repository?.id,
  })

  const itemsPerPage = 5
  const sortedContributors = [...contributors].sort((a, b) => b.total_contributions - a.total_contributions)
  const totalPages = Math.ceil(sortedContributors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentContributors = sortedContributors.slice(startIndex, endIndex)

  const chartData = sortedContributors.map((contributor: any) => ({
    name: contributor.username,
    value: contributor.total_contributions,
  }))

  if (error) {
    return <div className="text-red-500 text-center">Error loading contributors.</div>
  }

  const SkeletonLayout = () => (
    <div className="space-y-6 p-4">
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[300px] sm:h-[400px] w-full relative">
            <Skeleton className="h-full w-full" />
            <LoadingSpinner  />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )

  return (
    <>
      {isLoading ? (
        <SkeletonLayout />
      ) : (
        <div className="space-y-6 p-4">
          {/* Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">Contributions Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      bottom: 5,
                      left: 40,
                    }}
                  >
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: '#333',
                      }}
                      label={{
                        value: 'Total Contributions',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#555' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                      formatter={(value, name) => [`${value} contributions`, name]}
                    />
                    <Bar dataKey="value" fill="#007BFF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Username</TableHead>
                    <TableHead className="w-1/2 text-right">Total Contributions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentContributors.map((contributor: any) => (
                    <TableRow 
                      key={contributor.id}
                      className={contributor.username === selectedContributor ? 'bg-blue-100' : 'bg-white'}
                      onClick={() => setSelectedContributor(contributor.username)}
                    >
                      <TableCell className="font-medium">{contributor.username}</TableCell>
                      <TableCell className="text-right">{contributor.total_contributions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

