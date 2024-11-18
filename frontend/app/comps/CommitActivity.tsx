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

export function CommitActivity() {
  const { repository } = useRepository()
  
  const commitData = repository.commit_frequency || []
  const labels = commitData.map((_, index) => `Week ${index + 1}`)
  
  const data = {
    labels,
    datasets: [{
      label: 'Commits',
      data: commitData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Commit Activity'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return <Line data={data} options={options} />
}