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
import { formatDate } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function TimelineView() {
  const { repository } = useRepository()

  const timelineData = {
    labels: repository.timeline?.dates || [],
    datasets: [
      {
        label: 'Issues Opened',
        data: repository.timeline?.issues_opened || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Issues Closed',
        data: repository.timeline?.issues_closed || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'PRs Opened',
        data: repository.timeline?.prs_opened || [],
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      },
      {
        label: 'PRs Merged',
        data: repository.timeline?.prs_merged || [],
        borderColor: 'rgb(153, 102, 255)',
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
      tooltip: {
        callbacks: {
          title: (context: any) => formatDate(context[0].label)
        }
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

  return <Line data={timelineData} options={options} />
}