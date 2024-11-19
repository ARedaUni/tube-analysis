// import axios from 'axios'

// const API = axios.create({
//   baseURL: 'http://localhost:8000/api', // Replace with your backend URL
// })

// export const fetchRepositories = async () => {
//   const { data } = await API.get('/repositories/')
//   return data
// }

// export const fetchRepositoryDetails = async (name: string) => {
//   const { data } = await API.get(`/repositories/by-name/${name}/`)
//   return data
// }

// export const fetchContributors = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/contributors/`)
//   return data
// }

// export const fetchIssues = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/issues/`)
//   return data
// }

// export const fetchPullRequests = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/pull-requests/`)
//   return data
// }

// export const fetchRepositoryNames = async () => {
//   const { data } = await API.get('/repositories/names-only/')
//   return data
// }

// export const fetchRepositoryMetrics = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/metrics/`)
//   return data
// }

// export const fetchCodeAnalytics = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/code-analytics/`)
//   return data
// }

// export const fetchCommunityMetrics = async (repositoryId: number) => {
//   const { data } = await API.get(`/repositories/${repositoryId}/community-metrics/`)
//   return data
// }


import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', // Use environment variable
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

// export const fetchCodeAnalytics = (repositoryId: number) =>
//   fetchFromAPI(`/repositories/${repositoryId}/code-analytics/`)

// export const fetchCommunityMetrics = (repositoryId: number) =>
//   fetchFromAPI(`/repositories/${repositoryId}/community-metrics/`)
