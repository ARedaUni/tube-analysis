

// 'use client'

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
// import { Card, CardContent } from '@/components/ui/card'
// import { Star, GitFork, AlertCircle, CheckCircle } from 'lucide-react'

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
//   stars: number
//   forks: number
//   open_issues: number
//   closed_issues_count: number
//   starHistory?: { date: string; stars: number }[] // Optional if API doesn't provide this
// }

// export default function RepositoryOverview({ repository }: { repository: RepositoryData }) {
//   // Use a fallback for starHistory if it's not available in the API response
//   const starHistory = repository.starHistory || []

//   const chartData = {
//     labels: starHistory.map(item => item.date),
//     datasets: [
//       {
//         label: 'Stars',
//         data: starHistory.map(item => item.stars),
//         borderColor: 'rgb(75, 192, 192)',
//         backgroundColor: 'rgba(75, 192, 192, 0.5)',
//         tension: 0.1,
//       },
//     ],
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
//         {/* Stars */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <Star className="h-8 w-8 text-yellow-400 mb-2" />
//             <div className="text-2xl font-bold">{repository.stars.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Stars</p>
//           </CardContent>
//         </Card>

//         {/* Forks */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <GitFork className="h-8 w-8 text-blue-500 mb-2" />
//             <div className="text-2xl font-bold">{repository.forks.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Forks</p>
//           </CardContent>
//         </Card>

//         {/* Open Issues */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
//             <div className="text-2xl font-bold">{repository.open_issues.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Open Issues</p>
//           </CardContent>
//         </Card>

//         {/* Closed Issues */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-6">
//             <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
//             <div className="text-2xl font-bold">{repository.closed_issues_count.toLocaleString()}</div>
//             <p className="text-sm text-muted-foreground">Closed Issues</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Star History Chart */}
//       {starHistory.length > 0 && (
//         <Card>
//           <CardContent className="p-6">
//             <Line data={chartData} options={chartOptions} />
//           </CardContent>
//         </Card>
//       )}
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
import { Star, GitFork, AlertCircle, CheckCircle, Clock, GitPullRequest, Calendar } from 'lucide-react'

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
  avg_issue_close_time: string
  avg_pr_merge_time: string
  created_at: string
  updated_at: string
  starHistory?: { date: string; stars: number }[]
}

export default function RepositoryOverview({ repository }: { repository: RepositoryData }) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return (
    <div className="space-y-6">

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

        {/* Avg Issue Close Time */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{Math.round(parseFloat(repository.avg_issue_close_time.split(' ')[0]))} days</div>
            <p className="text-sm text-muted-foreground">Avg Issue Close Time</p>
          </CardContent>
        </Card>

        {/* Avg PR Merge Time */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <GitPullRequest className="h-8 w-8 text-indigo-500 mb-2" />
            <div className="text-2xl font-bold">{Math.round(parseFloat(repository.avg_pr_merge_time.split(':')[0]))} hours</div>
            <p className="text-sm text-muted-foreground">Avg PR Merge Time</p>
          </CardContent>
        </Card>

        {/* Created At */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 text-teal-500 mb-2" />
            <div className="text-lg font-bold">{formatDate(repository.created_at)}</div>
            <p className="text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>

        {/* Updated At */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 text-orange-500 mb-2" />
            <div className="text-lg font-bold">{formatDate(repository.updated_at)}</div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
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