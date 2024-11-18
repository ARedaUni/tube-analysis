'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRepository } from "@/hooks/useRepository"
import LoadingSpinner from "../comps/LoadingSpinner"
import { ResponseTimes } from "../comps/ResponseTimes"
import { ThroughputMetrics } from "../comps/ThroughputMetrics"
import { TimeToResolution } from "../comps/TimeToResolution"
import { QualityMetrics } from "../comps/QualityMetrics"

export default function PerformancePage() {
  const { repository, isLoading, error } = useRepository()

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!repository) return <div>No repository selected</div>

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Performance Metrics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimes />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <ThroughputMetrics />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Time to Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeToResolution />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <QualityMetrics />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}