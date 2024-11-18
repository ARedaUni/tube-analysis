'use client'
import RepositorySelector from '@/app/comps/RepositorySelector'
import RepositoryOverview from '@/app/comps/RepositoryOverview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from '../comps/LoadingSpinner'
import { fetchRepositoryDetails } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

export default function OverviewPage() {
  const { data: repository, isLoading, error } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => fetchRepositoryDetails('deno'),
  })
  repository && console.log(repository)
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
           {repository && <RepositoryOverview repository={repository}/>}
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