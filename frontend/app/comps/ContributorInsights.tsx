import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Contributor {
  username: string
  contributions: number
  repositories: string[]
}

const contributors: Contributor[] = [
  { username: 'johndoe', contributions: 523, repositories: ['repo1', 'repo2', 'repo3'] },
  { username: 'janedoe', contributions: 412, repositories: ['repo1', 'repo3'] },
  { username: 'bobsmith', contributions: 387, repositories: ['repo2', 'repo3'] },
  { username: 'alicejones', contributions: 298, repositories: ['repo1', 'repo2'] },
  { username: 'charliebrown', contributions: 256, repositories: ['repo3'] },
]

export default function ContributorInsights() {
  const chartData = {
    labels: contributors.map(c => c.username),
    datasets: [
      {
        label: 'Contributions',
        data: contributors.map(c => c.contributions),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Contributors',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <Bar options={chartOptions} data={chartData} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead className="hidden md:table-cell">Repositories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((contributor) => (
                <TableRow key={contributor.username}>
                  <TableCell className="font-medium">{contributor.username}</TableCell>
                  <TableCell>{contributor.contributions}</TableCell>
                  <TableCell className="hidden md:table-cell">{contributor.repositories.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}