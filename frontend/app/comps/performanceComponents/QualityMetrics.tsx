'use client'
import { useRepository } from "@/hooks/useRepository"
import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export function QualityMetrics() {
  const { repository } = useRepository()

  const qualityData = {
    labels: [
      'Code Review Coverage',
      'Test Coverage',
      'Documentation',
      'Issue Resolution',
      'PR Success Rate',
      'Code Style'
    ],
    datasets: [{
      label: 'Quality Score',
      data: [
        repository.code_review_coverage || 0,
        repository.test_coverage || 0,
        repository.documentation_score || 0,
        repository.issue_resolution_rate || 0,
        repository.pr_success_rate || 0,
        repository.code_style_score || 0
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgb(75, 192, 192)',
      pointBackgroundColor: 'rgb(75, 192, 192)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(75, 192, 192)'
    }]
  }

  const options = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  }

  return (
    <div className="space-y-4">
      <Radar data={qualityData} options={options} />
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-sm font-medium">Overall Quality Score</div>
          <div className="text-2xl font-bold">
            {Math.round(repository.overall_quality_score || 0)}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Quality Trend</div>
          <div className="text-2xl font-bold text-green-500">
            +{repository.quality_trend || 0}%
          </div>
        </div>
      </div>
    </div>
  )
}