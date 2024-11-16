'use client'
import RepositorySelector from '@/app/comps/RepositorySelector'
import RepositoryOverview from '@/app/comps/RepositoryOverview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OverviewPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Repository Overview</h2>
        <div className="flex items-center space-x-2">
          <RepositorySelector />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Repository Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RepositoryOverview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Repository Details</CardTitle>
            <CardDescription>
              Additional information about the selected repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add repository details component here */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}