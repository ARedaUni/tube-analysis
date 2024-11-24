'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRepository } from "@/hooks/useRepository"
import LoadingSpinner from "../comps/LoadingSpinner"
import { IssueMetrics } from "../comps/issuesandprs/IssueMetrics"
import { PRMetrics } from "../comps/issuesandprs/PRMetrics"
import { TimelineView } from "../comps/issuesandprs/TimelineView"
import RepositorySelector from "../comps/RepositorySelector"

export default function IssuesPRsPage() {
  const { repository, isLoading, error } = useRepository()

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!repository) return <div>No repository selected</div>

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Issues & Pull Requests</h2>
        <div className="flex items-center space-x-2">
          <RepositorySelector />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineView />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Issue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <IssueMetrics />
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>PR Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <PRMetrics />
          </CardContent>
        </Card> 

         
        {/* <Card>
          <CardHeader>
            <CardTitle>Review Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewAnalytics />
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}