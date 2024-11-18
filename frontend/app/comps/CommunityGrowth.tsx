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

export function CommunityGrowth() {
  const { repository } = useRepository()
  
  // Assuming we have growth data in the repository object
  const growthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Stars',
        data: repository.star_growth || [],
        borderColor: 'rgb(255, 206, 86)',
        tension: 0.1
      },
      {
        label: 'Forks',
        data: repository.fork_growth || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Contributors',
        data: repository.contributor_growth || [],
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
      title: {
        display: true,
        text: 'Community Growth Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return <Line data={growthData} options={options} />
}