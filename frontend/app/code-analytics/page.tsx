'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRepository } from "@/hooks/useRepository"
import LoadingSpinner from "../comps/LoadingSpinner"
import { LanguageDistribution } from "../comps/LanguageDistribution"
import { CommitActivity } from "../comps/CommitActivity"
import { CodeFrequency } from "../comps/CodeFrequency"
import { DependencyGraph } from "../comps/DependencyGraph"

export default function CodeAnalyticsPage() {
  const { repository, isLoading, error } = useRepository()

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!repository) return <div>No repository selected</div>

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Code Analytics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageDistribution />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Commit Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <CommitActivity />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Code Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeFrequency />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dependency Graph</CardTitle>
          </CardHeader>
          <CardContent>
            <DependencyGraph />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}