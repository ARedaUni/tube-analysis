'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface GitHubHealthMeterProps {
  positivePercentage?: number // Optional to handle loading state
  negativePercentage?: number // Optional to handle loading state
  isLoading?: boolean
}

export default function GitHubHealthMeter({
  positivePercentage,
  negativePercentage,
  isLoading,
}: GitHubHealthMeterProps) {
  if (isLoading) {
    return (
      
          <div className="flex flex-col items-center space-y-6">
            {/* Circular Skeleton */}
            <Skeleton className="w-64 h-64 rounded-full" />
            {/* Skeleton for Metrics */}
            <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
      
    )
  }

  const isHealthy = positivePercentage && positivePercentage >= 50
  const formattedPositive = positivePercentage?.toFixed(1) || "0.0"
  const formattedNegative = negativePercentage?.toFixed(1) || "0.0"

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Circular Progress */}
      <div className="relative w-64 h-64">
        {/* Background Circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Static Background */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#e5e7eb" // Tailwind gray-200
            strokeWidth="8"
          />
          {/* Dynamic Progress Arc */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={isHealthy ? '#10b981' : '#ef4444'} // Tailwind green-500 or red-500
            strokeWidth="8"
            strokeDasharray={`${positivePercentage! * 3.26} 1000`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-gray-800 mb-2">{formattedPositive}%</span>
          <div className="flex items-center mt-1">
            {isHealthy ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`ml-2 text-sm font-medium ${
                isHealthy ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isHealthy ? 'Healthy' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      </div>
      {/* Positive and Negative Metrics */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-1">Positive</div>
          <div className="text-2xl font-bold text-green-500">{formattedPositive}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-1">Negative</div>
          <div className="text-2xl font-bold text-red-500">{formattedNegative}%</div>
        </div>
      </div>
    </div>
  )
}
