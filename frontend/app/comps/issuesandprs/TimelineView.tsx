'use client'

import React, { useMemo } from 'react'
import { useRepository } from "@/hooks/useRepository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { fetchTimelineView } from "@/services/api"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { formatDate } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const chartColors = {
  issuesOpened: 'rgba(255, 99, 132, 0.8)',
  issuesClosed: 'rgba(75, 192, 192, 0.8)',
  prsOpened: 'rgba(54, 162, 235, 0.8)',
  prsMerged: 'rgba(153, 102, 255, 0.8)'
}

export function TimelineView() {
  const { repository } = useRepository()

  const { data: timelineView, isLoading, error } = useQuery({
    queryKey: ['timelineView', repository?.id],
    queryFn: () => fetchTimelineView(repository?.id),
    enabled: !!repository?.id,
  })

  const chartData = useMemo(() => {
    if (!timelineView) return null

    return {
      labels: timelineView.dates,
      datasets: [
        {
          label: 'Issues Opened',
          data: timelineView.issues_opened,
          borderColor: chartColors.issuesOpened,
          backgroundColor: chartColors.issuesOpened,
          tension: 0.1
        },
        {
          label: 'Issues Closed',
          data: timelineView.issues_closed,
          borderColor: chartColors.issuesClosed,
          backgroundColor: chartColors.issuesClosed,
          tension: 0.1
        },
        {
          label: 'PRs Opened',
          data: timelineView.prs_opened,
          borderColor: chartColors.prsOpened,
          backgroundColor: chartColors.prsOpened,
          tension: 0.1
        },
        {
          label: 'PRs Merged',
          data: timelineView.prs_merged,
          borderColor: chartColors.prsMerged,
          backgroundColor: chartColors.prsMerged,
          tension: 0.1
        }
      ]
    }
  }, [timelineView])

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => formatDate(context[0].label as string)
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading timeline data...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">Error loading timeline data</div>
  }

  if (!chartData) {
    return <div className="text-center">No timeline data available</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Repository Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <TabsList className="mb-4">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="line">
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </TabsContent>
          <TabsContent value="bar">
            <div className="h-[400px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}