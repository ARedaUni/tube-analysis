'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRepository } from "@/hooks/useRepository"
import LoadingSpinner from "../comps/LoadingSpinner"
import { HealthChecklist } from "../comps/HealthCheckList"
import { CommunityGrowth } from "../comps/CommunityGrowth"
import { EngagementMetrics } from "../comps/EngagementMetrics"
import { ContributorNetwork } from "../comps/ContributorNetwork"

export default function CommunityPage() {
  const { repository, isLoading, error } = useRepository()

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!repository) return <div>No repository selected</div>

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Community Health</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthChecklist />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Community Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <CommunityGrowth />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementMetrics />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contributor Network</CardTitle>
          </CardHeader>
          <CardContent>
            <ContributorNetwork />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}