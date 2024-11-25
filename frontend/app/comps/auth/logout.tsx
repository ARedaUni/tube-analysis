'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useToast } from "@/hooks/use-toast"
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { baseUrl } from '@/lib/baseUrl'

async function logoutUser() {
  const refreshToken = localStorage.getItem('refreshToken')
  const response = await fetch(`${baseUrl}/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) {
    throw new Error('Logout failed')
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export default function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast({
        title: 'Logout Successful',
        description: 'You have been successfully logged out.',
      })
      router.push('/login')
    },
    onError: () => {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <Button onClick={handleLogout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </Button>
  )
}