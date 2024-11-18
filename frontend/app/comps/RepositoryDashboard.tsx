// 'use client'
// import { Suspense } from 'react'
// import RepositorySelector from './RepositorySelector'
// import RepositoryOverview from './RepositoryOverview'
// import ContributorInsights from './ContributorInsights'
// import IssueAnalytics from './IssueAnalytics'
// import PullRequestInsights from './PullRequestInsights'
// import LoadingSpinner from './LoadingSpinner'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// export default function DashboardPage() {
//     return (
//       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
//         <div className="flex items-center justify-between space-y-2">
//           <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//           <div className="flex items-center space-x-2">
//             <RepositorySelector />
//           </div>
//         </div>
//         <Suspense fallback={<LoadingSpinner />}>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   className="h-4 w-4 text-muted-foreground"
//                 >
//                   <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//                 </svg>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">2,350</div>
//                 <p className="text-xs text-muted-foreground">+180 from last month</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   className="h-4 w-4 text-muted-foreground"
//                 >
//                   <circle cx="12" cy="12" r="10" />
//                   <line x1="12" y1="8" x2="12" y2="12" />
//                   <line x1="12" y1="16" x2="12.01" y2="16" />
//                 </svg>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">43</div>
//                 <p className="text-xs text-muted-foreground">-8 from last week</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   className="h-4 w-4 text-muted-foreground"
//                 >
//                   <path d="M16 3H21V8" />
//                   <path d="M18 13V21H3V6H11" />
//                   <path d="M21 3L11 13" />
//                 </svg>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">18</div>
//                 <p className="text-xs text-muted-foreground">+5 since yesterday</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Contributors</CardTitle>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   className="h-4 w-4 text-muted-foreground"
//                 >
//                   <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                   <circle cx="9" cy="7" r="4" />
//                   <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//                 </svg>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">573</div>
//                 <p className="text-xs text-muted-foreground">+21 since last month</p>
//               </CardContent>
//             </Card>
//           </div>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//             <Card className="col-span-4">
//               <CardHeader>
//                 <CardTitle>Repository Overview</CardTitle>
//               </CardHeader>
//               <CardContent className="pl-2">
//                 <RepositoryOverview />
//               </CardContent>
//             </Card>
//             <Card className="col-span-3">
//               <CardHeader>
//                 <CardTitle>Contributor Insights</CardTitle>
//                 <CardDescription>
//                   Top contributors and their impact
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ContributorInsights />
//               </CardContent>
//             </Card>
//           </div>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//             <Card className="col-span-4">
//               <CardHeader>
//                 <CardTitle>Issue Analytics</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <IssueAnalytics />
//               </CardContent>
//             </Card>
//             <Card className="col-span-3">
//               <CardHeader>
//                 <CardTitle>Pull Request Insights</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <PullRequestInsights />
//               </CardContent>
//             </Card>
//           </div>
//         </Suspense>
//       </div>
//     )
//   }


'use client'
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRepositories, fetchRepositoryDetails } from '@/services/api' // Your API functions
import RepositorySelector from './RepositorySelector'
import RepositoryOverview from './RepositoryOverview'
import ContributorInsights from './ContributorInsights'
import IssueAnalytics from './IssueAnalytics'
import PullRequestInsights from './PullRequestInsights'
import LoadingSpinner from './LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { data: repositories, isLoading, error } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => fetchRepositoryDetails('Hello-World'),
  })
  repositories && console.log(repositories)
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error fetching repositories: {error.message}</p>
      </div>
    )
  }

  // For demo purposes, select the first repository from the list
  const repository = repositories

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <RepositorySelector repositories={repositories} />
        </div>
      </div>
      {repository ? (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {/* Total Stars */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repository.stars}</div>
              <p className="text-xs text-muted-foreground">Stars from API</p>
            </CardContent>
          </Card>

          {/* Open Issues */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repository.open_issues_count}</div>
              <p className="text-xs text-muted-foreground">Open issues from API</p>
            </CardContent>
          </Card>

          {/* Forks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repository.forks}</div>
              <p className="text-xs text-muted-foreground">Forks from API</p>
            </CardContent>
          </Card>

          {/* Contributors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repository.contributors.length}</div>
              <p className="text-xs text-muted-foreground">Contributors count</p>
            </CardContent>
          </Card>
        </div>
        
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Repository Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RepositoryOverview repository={repository} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Contributor Insights</CardTitle>
                <CardDescription>Top contributors and their impact</CardDescription>
              </CardHeader>
              <CardContent>
                <ContributorInsights repositoryId={repository.id} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Issue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueAnalytics repository={repository} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pull Request Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <PullRequestInsights repositoryId={repository.id} />
              </CardContent>
            </Card>
          </div>
        </Suspense>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">No repositories available.</p>
        </div>
      )}
    </div>
  )
}
