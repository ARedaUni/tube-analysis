import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const prStatusData = {
  labels: ['Merged', 'Unmerged'],
  datasets: [
    {
      data: [75, 25],
      backgroundColor: ['#4CAF50', '#FFC107'],
    },
  ],
}

const prMergeTimeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Average PR Merge Time (hours)',
      data: [24, 22, 26, 20, 18, 16],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
}

export default function PullRequestInsights() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PR Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={prStatusData} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>PR Merge Time Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={prMergeTimeData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Average PR Merge Time Over Months',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Hours',
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}