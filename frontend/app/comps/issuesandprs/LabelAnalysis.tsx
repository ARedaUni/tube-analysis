'use client'
import { useRepository } from "@/hooks/useRepository"
import { Doughnut } from "react-chartjs-2"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function LabelAnalysis() {
  const { repository } = useRepository()

  const labelData = {
    labels: Object.keys(repository.label_stats || {}),
    datasets: [{
      data: Object.values(repository.label_stats || {}),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ]
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-[200px]">
        <Doughnut data={labelData} options={options} />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(repository.label_stats || {}).map(([label, count]) => (
          <Badge key={label} variant="secondary">
            {label}: {count}
          </Badge>
        ))}
      </div>
    </div>
  )
}