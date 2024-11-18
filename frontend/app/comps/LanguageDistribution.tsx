'use client'
import { useRepository } from "@/hooks/useRepository"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export function LanguageDistribution() {
  const { repository } = useRepository()
  
  const languages = repository.languages || {}
  const total = Object.values(languages).reduce((acc: number, val: number) => acc + val, 0)
  
  const data = {
    labels: Object.keys(languages),
    datasets: [{
      data: Object.values(languages).map(val => ((val as number / total) * 100).toFixed(1)),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
      borderWidth: 1
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Language Distribution (%)'
      }
    }
  }

  return <Pie data={data} options={options} />
}