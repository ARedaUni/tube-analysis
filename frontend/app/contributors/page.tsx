'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContributorInsights from '../comps/ContributorInsights'
import {ContributorList} from '../comps/contributor-list'

export default function ContributorsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contributors</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Contributor Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ContributorInsights />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>
              List of top contributors by number of commits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContributorList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}