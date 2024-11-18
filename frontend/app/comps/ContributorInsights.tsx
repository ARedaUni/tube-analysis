// import React from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Bar } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// )

// interface Contributor {
//   username: string
//   contributions: number
//   repositories: string[]
// }

// const contributors: Contributor[] = [
//   { username: 'johndoe', contributions: 523, repositories: ['repo1', 'repo2', 'repo3'] },
//   { username: 'janedoe', contributions: 412, repositories: ['repo1', 'repo3'] },
//   { username: 'bobsmith', contributions: 387, repositories: ['repo2', 'repo3'] },
//   { username: 'alicejones', contributions: 298, repositories: ['repo1', 'repo2'] },
//   { username: 'charliebrown', contributions: 256, repositories: ['repo3'] },
// ]

// export default function ContributorInsights() {
//   const chartData = {
//     labels: contributors.map(c => c.username),
//     datasets: [
//       {
//         label: 'Contributions',
//         data: contributors.map(c => c.contributions),
//         backgroundColor: 'rgba(75, 192, 192, 0.6)',
//       },
//     ],
//   }

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Top Contributors',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   }

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardContent className="p-6">
//           <Bar options={chartOptions} data={chartData} />
//         </CardContent>
//       </Card>
//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Username</TableHead>
//                 <TableHead>Contributions</TableHead>
//                 <TableHead className="hidden md:table-cell">Repositories</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {contributors.map((contributor) => (
//                 <TableRow key={contributor.username}>
//                   <TableCell className="font-medium">{contributor.username}</TableCell>
//                   <TableCell>{contributor.contributions}</TableCell>
//                   <TableCell className="hidden md:table-cell">{contributor.repositories.join(', ')}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchContributors } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Contributor {
  id: number
  username: string
  contributions: number
  repositories: number[]
}

export default function ContributorInsights({ repositoryId }: { repositoryId: number }) {
  const { data: contributors = [], isLoading, error } = useQuery({
    queryKey: ['contributors', repositoryId],
    queryFn: () => fetchContributors(repositoryId),
    enabled: !!repositoryId, // Only fetch when repositoryId is available
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  if (isLoading) {
    return <div>Loading contributors...</div>
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error fetching contributors.</p>
      </div>
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(contributors.length / itemsPerPage)
  const paginatedContributors = contributors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const chartData = {
    labels: contributors.map((c: Contributor) => c.username),
    datasets: [
      {
        label: 'Contributions',
        data: contributors.map((c: Contributor) => c.contributions),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Contributors',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <Bar options={chartOptions} data={chartData} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead className="hidden md:table-cell">Repositories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContributors.map((contributor: Contributor) => (
                <TableRow key={contributor.id}>
                  <TableCell className="font-medium">{contributor.username}</TableCell>
                  <TableCell>{contributor.contributions}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contributor.repositories.join(', ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
