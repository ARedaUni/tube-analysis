// 'use client'
// import { useRepository } from "@/hooks/useRepository"
// import { Bar } from "react-chartjs-2"
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js'
// import { Card } from "@/components/ui/card"
// import { formatDuration, calculatePercentage } from "@/lib/utils"
// import { ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react"
// import { fetchRepositoryMetrics } from "@/services/api"
// import { useQuery } from "@tanstack/react-query"

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// )

// export function ReviewAnalytics() {
//   const { repository } = useRepository()

//   const { data: metric = [], isLoading, error } = useQuery({
//     queryKey: ['contributors', repository?.id],
//     queryFn: () => fetchRepositoryMetrics(repository?.id),
//     enabled: !!repository?.id,
//   })

//   const reviewData = {
//     labels: ['0-1', '2-3', '4-5', '6+'],
//     datasets: [{
//       label: 'Number of Reviews per PR',
//       data: repository.reviews_per_pr_distribution || [0, 0, 0, 0],
//       backgroundColor: 'rgba(75, 192, 192, 0.8)',
//     }]
//   }

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Number of PRs'
//         }
//       },
//       x: {
//         title: {
//           display: true,
//           text: 'Number of Reviews'
//         }
//       }
//     }
//   }

//   const metrics = [
//     {
//       title: "Approval Rate",
//       value: `${calculatePercentage(repository.approved_prs, repository.total_reviewed_prs)}%`,
//       icon: ThumbsUp,
//       color: "text-green-500"
//     },
//     {
//       title: "Change Requests",
//       value: `${calculatePercentage(repository.change_requested_prs, repository.total_reviewed_prs)}%`,
//       icon: ThumbsDown,
//       color: "text-red-500"
//     },
//     {
//       title: "Avg Review Time",
//       value: formatDuration(repository.avg_review_time),
//       icon: Clock,
//       color: "text-blue-500"
//     },
//     {
//       title: "Active Reviewers",
//       value: repository.active_reviewers_count,
//       icon: Users,
//       color: "text-purple-500"
//     }
//   ]

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-2 gap-4">
//         {metrics.map((metric) => (
//           <Card key={metric.title} className="p-4">
//             <div className="flex items-center space-x-2">
//               <metric.icon className={`h-4 w-4 ${metric.color}`} />
//               <span className="text-sm font-medium">{metric.title}</span>
//             </div>
//             <div className="mt-3 text-2xl font-bold">{metric.value}</div>
//           </Card>
//         ))}
//       </div>

//       <div>
//         <h3 className="text-sm font-medium mb-3">Reviews Distribution</h3>
//         <Bar data={reviewData} options={options} />
//       </div>

//       {repository.top_reviewers && (
//         <div className="mt-4">
//           <h3 className="text-sm font-medium mb-2">Top Reviewers</h3>
//           <div className="space-y-2">
//             {repository.top_reviewers.map((reviewer: any) => (
//               <div key={reviewer.username} className="flex justify-between items-center">
//                 <span>{reviewer.username}</span>
//                 <span className="text-muted-foreground">{reviewer.review_count} reviews</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useRepository } from "@/hooks/useRepository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration, calculatePercentage } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react"
import { fetchRepositoryMetrics } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ReviewAnalytics() {
  const { repository } = useRepository()

  const { data: metric = {}, isLoading, error } = useQuery({
    queryKey: ['metrics', repository?.id],
    queryFn: () => fetchRepositoryMetrics(repository?.id),
    enabled: !!repository?.id,
  })

  const reviewData = [
    { name: '0-1', reviews: repository.reviews_per_pr_distribution?.[0] || 0 },
    { name: '2-3', reviews: repository.reviews_per_pr_distribution?.[1] || 0 },
    { name: '4-5', reviews: repository.reviews_per_pr_distribution?.[2] || 0 },
    { name: '6+', reviews: repository.reviews_per_pr_distribution?.[3] || 0 },
  ]

  const metrics = [
    {
      title: "Approval Rate",
      value: metric.reviews?.approval_rate || '0%',
      icon: ThumbsUp,
      color: "text-success",
      bgColor: "bg-success/20"
    },
    {
      title: "Change Requests",
      value: metric.reviews?.change_request_rate || '0%',
      icon: ThumbsDown,
      color: "text-destructive",
      bgColor: "bg-destructive/20"
    },
    {
      title: "Avg Review Time",
      value: formatDuration(metric.reviews?.avg_review_time || 0),
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/20"
    },
    {
      title: "Active Reviewers",
      value: metric.reviews?.active_reviewers_count || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Review Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.title} className={`p-4 ${metric.bgColor}`}>
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-sm font-medium">{metric.title}</span>
              </div>
              <div className="mt-3 text-2xl font-bold">{metric.value}</div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Reviews Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviews" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {repository.top_reviewers && (
            <div>
              <h3 className="text-lg font-medium mb-3">Top Reviewers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {repository.top_reviewers.map((reviewer: any) => (
                  <Card key={reviewer.username} className="p-4 flex items-center space-x-4 bg-secondary/50">
                    <Avatar>
                      <AvatarImage src={`https://github.com/${reviewer.username}.png`} alt={reviewer.username} />
                      <AvatarFallback>{reviewer.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{reviewer.username}</p>
                      <p className="text-sm text-muted-foreground">{reviewer.review_count} reviews</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}