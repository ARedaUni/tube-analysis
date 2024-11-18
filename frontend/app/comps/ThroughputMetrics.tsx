'use client'
import { useRepository } from "@/hooks/useRepository"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function ThroughputMetrics() {
  const { repository } = useRepository()

  // Assuming we have weekly throughput data in the repository
  const throughputData = {
    labels: repository.throughput_metrics?.weeks || [],
    datasets: [
      {
        label: 'Issues Closed',
        data: repository.throughput_metrics?.issues_closed || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'PRs Merged',
        data: repository.throughput_metrics?.prs_merged || [],
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      },
      {
        label: 'Commits',
        data: repository.throughput_metrics?.commits || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Throughput'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <Line data={throughputData} options={options} />
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-sm font-medium">Avg Issues/Week</div>
          <div className="text-2xl font-bold">
            {Math.round(repository.avg_weekly_issues || 0)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Avg PRs/Week</div>
          <div className="text-2xl font-bold">
            {Math.round(repository.avg_weekly_prs || 0)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Avg Commits/Week</div>
          <div className="text-2xl font-bold">
            {Math.round(repository.avg_weekly_commits || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}