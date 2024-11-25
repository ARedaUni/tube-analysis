import { baseUrl } from '@/lib/baseUrl'
import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || `${baseUrl}/api`, // Use environment variable
})

// Centralized GET request function with error handling
const fetchFromAPI = async (endpoint: string, params = {}) => {
  try {
    const { data } = await API.get(endpoint, { params })
    return data
  } catch (error: any) {
    console.error(`API fetch failed for endpoint: ${endpoint}`, error)
    throw error
  }
}

// API functions
export const fetchRepositories = () => fetchFromAPI('/repositories/')

export const fetchRepositoryDetails = (name: string) =>
  fetchFromAPI(`/repositories/by-name/${name}/`)

export const fetchContributors = (repositoryId: number) =>
  fetchFromAPI(`/repositories/${repositoryId}/contributors/`)

export const fetchIssues = (repositoryId: number) =>
  fetchFromAPI(`/repositories/${repositoryId}/issues/`)

export const fetchPullRequests = (repositoryId: number) =>
  fetchFromAPI(`/repositories/${repositoryId}/pull-requests/`)

export const fetchRepositoryNames = () => fetchFromAPI('/repositories/names-only/')

export const fetchRepositoryMetrics = (repositoryId: number) =>
  fetchFromAPI(`/repositories/${repositoryId}/metrics/`)

export const fetchTimelineView = (repositoryId: number) => 
  fetchFromAPI(`/repositories/${repositoryId}/timeline`)

export const fetchHealthAndQuality = (repositoryId: number) =>
  fetchFromAPI(`/repositories/${repositoryId}/health-and-quality/`);


// export const fetchCodeAnalytics = (repositoryId: number) =>
//   fetchFromAPI(`/repositories/${repositoryId}/code-analytics/`)

// export const fetchCommunityMetrics = (repositoryId: number) =>
//   fetchFromAPI(`/repositories/${repositoryId}/community-metrics/`)
