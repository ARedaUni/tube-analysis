import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your backend URL
})

export const fetchRepositories = async () => {
  const { data } = await API.get('/repositories/')
  return data
}

export const fetchRepositoryDetails = async (name: string) => {
  const { data } = await API.get(`/repositories/by-name/${name}/`)
  return data
}

export const fetchContributors = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/contributors/`)
  return data
}

export const fetchIssues = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/issues/`)
  return data
}

export const fetchPullRequests = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/pull-requests/`)
  return data
}

export const fetchRepositoryNames = async () => {
  const { data } = await API.get('/repositories/names-only/')
  return data
}

export const fetchRepositoryMetrics = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/metrics/`)
  return data
}

export const fetchCodeAnalytics = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/code-analytics/`)
  return data
}

export const fetchCommunityMetrics = async (repositoryId: number) => {
  const { data } = await API.get(`/repositories/${repositoryId}/community-metrics/`)
  return data
}