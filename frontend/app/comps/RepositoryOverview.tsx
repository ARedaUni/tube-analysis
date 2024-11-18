// 'use client'

// import { useEffect, useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Star, GitFork, AlertCircle, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
// import { Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// )

// interface RepositoryData {
//   name: string
//   owner: string
//   stars: number
//   forks: number
//   openIssuesCount: number
//   closedIssuesCount: number
//   mergedPrCount: number
//   unmergedPrCount: number
//   positiveCommentPercentage: number
//   negativeCommentPercentage: number
//   neutralCommentPercentage: number
//   starHistory: { date: string; stars: number }[]
// }

// export default function RepositoryOverview() {
//   const [repositoryData, setRepositoryData] = useState<RepositoryData | null>(null)

//   useEffect(() => {
//     // Simulating API call to fetch repository data
//     const fetchData = async () => {
//       // Replace this with actual API call
//       const data: RepositoryData = {
//         name: 'next.js',
//         owner: 'vercel',
//         stars: 98765,
//         forks: 23456,
//         openIssuesCount: 543,
//         closedIssuesCount: 7890,
//         mergedPrCount: 4567,
//         unmergedPrCount: 123,
//         positiveCommentPercentage: 75.5,
//         negativeCommentPercentage: 10.2,
//         neutralCommentPercentage: 14.3,
//         starHistory: [
//           { date: '2023-01', stars: 90000 },
//           { date: '2023-02', stars: 92000 },
//           { date: '2023-03', stars: 94000 },
//           { date: '2023-04', stars: 96000 },
//           { date: '2023-05', stars: 98765 },
//         ],
//       }
//       setRepositoryData(data)
//     }
//     fetchData()
//   }, [])

//   if (!repositoryData) {
//     return <div>Loading repository data...</div>
//   }

//   const chartData = {
//     labels: repositoryData.starHistory.map(item => item.date),
//     datasets: [
//       {
//         label: 'Stars',
//         data: repositoryData.starHistory.map(item => item.stars),
//         borderColor: 'rgb(75, 192, 192)',
//         backgroundColor: 'rgba(75, 192, 192, 0.5)',
//         tension: 0.1
//       }
//     ]
//   }

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Star History',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: false,
//       },
//     },
//   }

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <Star className="h-8 w-8 text-yellow-400 mb-2" />
//             <div className="text-2xl font-bold">{repositoryData.stars.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Stars</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <GitFork className="h-8 w-8 text-blue-500 mb-2" />
//             <div className="text-2xl font-bold">{repositoryData.forks.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Forks</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
//             <div className="text-2xl font-bold">{repositoryData.openIssuesCount.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Open Issues</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
//             <div className="text-2xl font-bold">{repositoryData.closedIssuesCount.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Closed Issues</p>
//           </CardContent>
//         </Card>
//       </div>
//       <Card>
//         <CardContent className="p-6">
//           <Line data={chartData} options={chartOptions} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Card, CardContent } from '@/components/ui/card'
import { Star, GitFork, AlertCircle, CheckCircle } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RepositoryData {
  name: string
  stars: number
  forks: number
  open_issues: number
  closed_issues_count: number
  starHistory?: { date: string; stars: number }[] // Optional if API doesn't provide this
}

export default function RepositoryOverview({ repository }: { repository: RepositoryData }) {
  // Use a fallback for starHistory if it's not available in the API response
  const starHistory = repository.starHistory || []

  const chartData = {
    labels: starHistory.map(item => item.date),
    datasets: [
      {
        label: 'Stars',
        data: starHistory.map(item => item.stars),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
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
        text: 'Star History',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Stars */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Star className="h-8 w-8 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold">{repository.stars.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Stars</p>
          </CardContent>
        </Card>

        {/* Forks */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <GitFork className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{repository.forks.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Forks</p>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{repository.open_issues.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Open Issues</p>
          </CardContent>
        </Card>

        {/* Closed Issues */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{repository.closed_issues_count.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Closed Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Star History Chart */}
      {starHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Line data={chartData} options={chartOptions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
