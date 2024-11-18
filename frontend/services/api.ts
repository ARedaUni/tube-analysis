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
