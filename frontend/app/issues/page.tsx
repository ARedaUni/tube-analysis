'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IssueAnalytics from "@/app/comps/IssueAnalytics"
import { IssueList } from '@/app/comps/issue-list'

export default function IssuesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Issues</h2>
      </div>
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
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>
              List of recently opened or updated issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssueList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}