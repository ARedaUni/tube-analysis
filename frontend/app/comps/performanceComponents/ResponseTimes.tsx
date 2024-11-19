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
import { formatDuration } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function ResponseTimes() {
  const { repository } = useRepository()

  const responseData = {
    labels: ['Issues', 'Pull Requests', 'Comments'],
    datasets: [{
      label: 'Average Response Time (hours)',
      data: [
        repository.median_issue_response_time,
        repository.median_pr_response_time,
        repository.median_comment_response_time
      ].map(time => time ? parseFloat(time) / (1000 * 60 * 60) : 0),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ],
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const hours = context.raw;
            return `Response Time: ${formatDuration(hours * 60 * 60 * 1000)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <Bar data={responseData} options={options} />
      <div className="grid grid-cols-3 gap-4 text-center">
        {responseData.labels.map((label, index) => (
          <div key={label} className="space-y-1">
            <div className="text-sm font-medium">{label}</div>
            <div className="text-2xl font-bold">
              {formatDuration(responseData.datasets[0].data[index] * 60 * 60 * 1000)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}