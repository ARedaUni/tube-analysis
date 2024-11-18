'use client'
import { useRepository } from "@/hooks/useRepository"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function CodeFrequency() {
  const { repository } = useRepository()
  
  const codeFrequency = repository.code_frequency || {}
  const labels = Object.keys(codeFrequency).map(week => `Week ${week}`)
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Additions',
        data: codeFrequency.additions || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: 'Deletions',
        data: codeFrequency.deletions?.map(val => -val) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
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
        text: 'Code Changes Over Time'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Lines of Code'
        }
      }
    }
  }

  return <Bar data={data} options={options} />
}