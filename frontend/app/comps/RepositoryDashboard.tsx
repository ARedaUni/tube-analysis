
'use client'

import { Suspense } from 'react'
import { useRepository } from '@/hooks/useRepository'
import RepositorySelector from './RepositorySelector'
import RepositoryOverview from './RepositoryOverview'
import ContributorInsights from './contributorComponents/ContributorInsights'
import IssueAnalytics from './IssueAnalytics'
import PullRequestInsights from './PullRequestInsights'
import LoadingSpinner from './LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export default function DashboardPage() {
  const { repository, isLoading, error } = useRepository()

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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <RepositorySelector />
        </div>
      </div>
      
      {repository ? (
        <Suspense fallback={<LoadingSpinner />}>
          {/* GitHub Health Meter - Now positioned first */}
        

          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">{capitalize(repository.name)}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RepositoryOverview />
            </CardContent>
          </Card>

         

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Issue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueAnalytics />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pull Request Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <PullRequestInsights />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Contributor Insights</CardTitle>
                <CardDescription>Top contributors and their impact</CardDescription>
              </CardHeader>
              <CardContent>
                <ContributorInsights />
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