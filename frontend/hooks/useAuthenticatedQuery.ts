import { useQuery, useMutation } from '@tanstack/react-query'

async function refreshToken(refreshToken: string) {
  const response = await fetch('http://localhost:8000/auth/login/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })
  if (!response.ok) {
    throw new Error('Token refresh failed')
  }
  const data = await response.json()
  localStorage.setItem('accessToken', data.access)
  return data.access
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => refreshToken(localStorage.getItem('refreshToken') || ''),
    onSuccess: (newAccessToken) => {
      localStorage.setItem('accessToken', newAccessToken)
    },
  })
}

export function useAuthenticatedQuery(key: string[], queryFn: () => Promise<any>) {
  const refreshTokenMutation = useRefreshToken()

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return await queryFn()
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          await refreshTokenMutation.mutateAsync()
          return queryFn()
        }
        throw error
      }
    },
  })
}