import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const issueSentimentData = {
  labels: ['Positive', 'Negative', 'Neutral'],
  datasets: [
    {
      data: [65, 15, 20],
      backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
    },
  ],
}

const issueResolutionTimeData = {
  labels: ['< 1 day', '1-3 days', '3-7 days', '1-2 weeks', '2+ weeks'],
  datasets: [
    {
      label: 'Number of Issues',
      data: [30, 50, 20, 10, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    },
  ],
}

export default function IssueAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issue Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Pie data={issueSentimentData} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Issue Resolution Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={issueResolutionTimeData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Issue Resolution Time',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}