import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRepositoryDetails } from '@/services/api'

export function useRepository() {
  const queryClient = useQueryClient()

  const { data: repository, isLoading, error } = useQuery({
    queryKey: ['currentRepository'],
    queryFn: () => fetchRepositoryDetails('Hello-World'), // Default repository
    staleTime: Infinity, // Keep the data fresh indefinitely
  })

  const setCurrentRepository = async (repoName: string) => {
    // Prefetch the new repository data
    await queryClient.prefetchQuery({
      queryKey: ['currentRepository'],
      queryFn: () => fetchRepositoryDetails(repoName),
    })

    // Invalidate the current query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['currentRepository'] })
  }

  return {
    repository,
    isLoading,
    error,
    setCurrentRepository,
  }
} 