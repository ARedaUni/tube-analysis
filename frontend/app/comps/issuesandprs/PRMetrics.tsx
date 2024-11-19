// // 'use client'

// // import { useRepository } from "@/hooks/useRepository"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { formatDuration, calculatePercentage } from "@/lib/utils"
// // import { GitMerge, GitPullRequest, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react'
// // import { useQuery } from "@tanstack/react-query"
// // import { fetchRepositoryMetrics } from "@/services/api"
// // import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

// // export function PRMetrics() {
// //   const { repository } = useRepository()

// //   const { data: metric = {}, isLoading, error } = useQuery({
// //     queryKey: ['metrics', repository?.id],
// //     queryFn: () => fetchRepositoryMetrics(repository?.id),
// //     enabled: !!repository?.id,
// //   })
// //   console.log(metric)
// //   const mergeRate = metric.performance?.pr_merge_rate || 0

// //   const prStatusData = [
// //     { name: 'Merged', value: repository.merged_pr_count },
// //     { name: 'Open', value: repository.open_pr_count },
// //     { name: 'Closed', value: repository.closed_pr_count },
// //   ]

// //   const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))']

// //   const metrics = [
// //     {
// //       title: "Merge Rate",
// //       value: `${mergeRate.toFixed(2)}%`,
// //       icon: mergeRate > 50 ? TrendingUp : TrendingDown,
// //       color: mergeRate > 50 ? "text-success" : "text-destructive",
// //       bgColor: mergeRate > 50 ? "bg-success/20" : "bg-destructive/20"
// //     },
// //     {
// //       title: "Open PRs",
// //       value: repository.open_pr_count,
// //       icon: GitPullRequest,
// //       color: "text-warning",
// //       bgColor: "bg-warning/20"
// //     },
// //     {
// //       title: "Avg Merge Time",
// //       value: formatDuration(metric.performance?.median_pr_response_time || 0),
// //       icon: Clock,
// //       color: "text-info",
// //       bgColor: "bg-info/20"
// //     },
// //     {
// //       title: "Active Contributors",
// //       value: metric.growth?.contributor_growth_rate?.toFixed(0) || 0,
// //       icon: Users,
// //       color: "text-primary",
// //       bgColor: "bg-primary/20"
// //     }
// //   ]

// //   return (
// //     <Card className="w-full">
// //       <CardHeader>
// //         <CardTitle className="text-2xl font-bold">Pull Request Metrics</CardTitle>
// //       </CardHeader>
// //       <CardContent>
// //         <div className="grid grid-cols-2 gap-4 mb-6">
// //           {metrics.map((metric) => (
// //             <Card key={metric.title} className={`p-4 hover:shadow-md transition-shadow ${metric.bgColor}`}>
// //               <div className="flex justify-between items-start">
// //                 <div>
// //                   <p className="text-sm font-medium mb-1">{metric.title}</p>
// //                   <p className="text-2xl font-bold">{metric.value}</p>
// //                 </div>
// //                 <metric.icon className={`h-5 w-5 ${metric.color}`} />
// //               </div>
// //             </Card>
// //           ))}
// //         </div>

// //         <div>
// //           <h3 className="text-lg font-medium mb-3">PR Status Distribution</h3>
// //           <div className="h-[300px]">
// //             <ResponsiveContainer width="100%" height="100%">
// //               <PieChart>
// //                 <Pie
// //                   data={prStatusData}
// //                   cx="50%"
// //                   cy="50%"
// //                   labelLine={false}
// //                   outerRadius={80}
// //                   fill="#8884d8"
// //                   dataKey="value"
// //                 >
// //                   {prStatusData.map((entry, index) => (
// //                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //                   ))}
// //                 </Pie>
// //                 <Tooltip />
// //                 <Legend />
// //               </PieChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   )
// // }


// 'use client'

// import { useRepository } from "@/hooks/useRepository"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { formatDuration, calculatePercentage } from "@/lib/utils"
// import { GitMerge, GitPullRequest, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react'
// import { useQuery } from "@tanstack/react-query"
// import { fetchRepositoryMetrics } from "@/services/api"
// import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

// export function PRMetrics() {
//   const { repository } = useRepository()

//   const { data: metric = {}, isLoading, error } = useQuery({
//     queryKey: ['metrics', repository?.id],
//     queryFn: () => fetchRepositoryMetrics(repository?.id),
//     enabled: !!repository?.id,
//   })

//   // Merge rate from metrics
//   const mergeRate = metric.performance?.pr_merge_rate || 0

//   // PR status data for Pie Chart
//   const prStatusData = [
//     { name: 'Merged', value: repository.merged_pr_count || 0 },
//     { name: 'Open', value: repository.unmerged_pr_count || 0 },
//     { name: 'Closed', value: repository.closed_issues_count || 0 },
//   ]

//   // Pie chart colors
//   const COLORS = [
//     'hsl(var(--success, 120, 40%, 45%))',     // Green fallback
//     'hsl(var(--warning, 50, 100%, 50%))',    // Yellow fallback
//     'hsl(var(--destructive, 0, 70%, 50%))',  // Red fallback
//   ]
  

//   // Metrics cards
//   const metrics = [
//     {
//       title: "Merge Rate",
//       value: `${mergeRate.toFixed(2)}%`,
//       icon: mergeRate > 50 ? TrendingUp : TrendingDown,
//       color: mergeRate > 50 ? "text-success" : "text-destructive",
//       bgColor: mergeRate > 50 ? "bg-success/20" : "bg-destructive/20"
//     },
//     {
//       title: "Open PRs",
//       value: repository.unmerged_pr_count || 0,
//       icon: GitPullRequest,
//       color: "text-warning",
//       bgColor: "bg-warning/20"
//     },
//     {
//       title: "Avg Merge Time",
//       value: formatDuration(metric.performance?.median_pr_response_time || 0),
//       icon: Clock,
//       color: "text-info",
//       bgColor: "bg-info/20"
//     },
//     {
//       title: "Active Contributors",
//       value: metric.growth?.contributor_growth_rate?.toFixed(0) || 0,
//       icon: Users,
//       color: "text-primary",
//       bgColor: "bg-primary/20"
//     }
//   ]

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Pull Request Metrics</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {/* Metrics Cards */}
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           {metrics.map((metric) => (
//             <Card key={metric.title} className={`p-4 hover:shadow-md transition-shadow ${metric.bgColor}`}>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm font-medium mb-1">{metric.title}</p>
//                   <p className="text-2xl font-bold">{metric.value}</p>
//                 </div>
//                 <metric.icon className={`h-5 w-5 ${metric.color}`} />
//               </div>
//             </Card>
//           ))}
//         </div>

//         {/* PR Status Pie Chart */}
//         <div>
//           <h3 className="text-lg font-medium mb-3">PR Status Distribution</h3>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={prStatusData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {prStatusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


'use client'

import { useRepository } from "@/hooks/useRepository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration } from "@/lib/utils"
import { GitPullRequest, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { useQuery } from "@tanstack/react-query"
import { fetchRepositoryMetrics } from "@/services/api"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

export function PRMetrics() {
  const { repository } = useRepository()

  const { data: metric = {}, isLoading, error } = useQuery({
    queryKey: ['metrics', repository?.id],
    queryFn: () => fetchRepositoryMetrics(repository?.id),
    enabled: !!repository?.id,
  })

  // Merge rate with fallback
  const mergeRate = metric.performance?.pr_merge_rate || 0

  // PR status data with fallback values
  const prStatusData = [
    { name: 'Merged', value: repository.merged_pr_count || 0 },
    { name: 'Open', value: repository.unmerged_pr_count || 0 },
    { name: 'Closed', value: repository.closed_issues_count || 0 },
  ]

  // Fallback colors for Pie chart in case CSS variables are not defined
  const COLORS = [
    'hsl(var(--success, 120, 40%, 45%))',     // Green fallback
    'hsl(var(--warning, 50, 100%, 50%))',     // Yellow fallback
    'hsl(var(--destructive, 0, 70%, 50%))',   // Red fallback
  ]

  // Metrics cards with conditional color classes and hardcoded fallback colors
  const metrics = [
    {
      title: "Merge Rate",
      value: `${mergeRate.toFixed(2)}%`,
      icon: mergeRate > 50 ? TrendingUp : TrendingDown,
      color: mergeRate > 50 ? "text-[color:var(--success,#28a745)]" : "text-[color:var(--destructive,#dc3545)]",
      bgColor: mergeRate > 50 ? "bg-[color:var(--success,#28a745)]/20" : "bg-[color:var(--destructive,#dc3545)]/20"
    },
    {
      title: "Open PRs",
      value: repository.unmerged_pr_count || 0,
      icon: GitPullRequest,
      color: "text-[color:var(--warning,#ffc107)]",
      bgColor: "bg-[color:var(--warning,#ffc107)]/20"
    },
    {
      title: "Avg Merge Time",
      value: formatDuration(metric.performance?.median_pr_response_time || 0),
      icon: Clock,
      color: "text-[color:var(--info,#17a2b8)]",
      bgColor: "bg-[color:var(--info,#17a2b8)]/20"
    },
    {
      title: "Active Contributors",
      value: metric.growth?.contributor_growth_rate?.toFixed(0) || 0,
      icon: Users,
      color: "text-[color:var(--primary,#007bff)]",
      bgColor: "bg-[color:var(--primary,#007bff)]/20"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Pull Request Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.title} className={`p-4 hover:shadow-md transition-shadow ${metric.bgColor}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* PR Status Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-3">PR Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
