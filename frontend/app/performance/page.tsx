// 'use client';

// import ActivityChart from '@/app/comps/performanceComponents/ActivityChart';
// import PerformanceMetrics from '@/app/comps/performanceComponents/PerformanceMetrics';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { useRepository } from '@/hooks/useRepository';
// import { fetchRepositoryMetrics } from '@/services/api';
// import { useQuery } from '@tanstack/react-query';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// export default function RepositoryPerformance() {
//   const { repository } = useRepository();

//   const { data: metrics = {}, isLoading, error } = useQuery({
//     queryKey: ['metrics', repository?.id],
//     queryFn: () => fetchRepositoryMetrics(repository?.id),
//     enabled: !!repository?.id, // Only fetch if repository ID exists
//   });

//   if (error) return <div>Error loading metrics</div>;

//   return (
//     <div className="space-y-6">
//       {/* Repository Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">
//             {isLoading ? <Skeleton width={200} /> : `${repository?.owner}/${repository?.name}`}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p>{isLoading ? <Skeleton count={3} /> : repository?.description}</p>
//         </CardContent>
//       </Card>

//       {/* Activity Chart */}
//       {isLoading ? (
//         <div className="bg-white p-4 rounded shadow">
//           <Skeleton height={250} />
//         </div>
//       ) : (
//         <ActivityChart metrics={metrics.activity} />
//       )}

//       {/* Performance Metrics */}
//       {isLoading ? (
//         <div className="bg-white p-4 rounded shadow">
//           <Skeleton count={4} />
//         </div>
//       ) : (
//         <PerformanceMetrics metrics={metrics.performance} />
//       )}
//     </div>
//   );
// }


'use client';

import { Bar, Line, Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useRepository } from '@/hooks/useRepository';
import { fetchRepositoryMetrics } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default function RepositoryPerformance() {
  const { repository } = useRepository();

  const { data: metrics = {}, isLoading, error } = useQuery({
    queryKey: ['metrics', repository?.id],
    queryFn: () => fetchRepositoryMetrics(repository?.id),
    enabled: !!repository?.id,
  });

  if (error) return <div>Error loading metrics</div>;

  // Prepare chart data
  const commitFrequencyData = {
    labels: metrics.activity?.code_frequency?.weeks?.map((week) =>
      new Date(week * 1000).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Additions',
        data: metrics.activity?.code_frequency?.additions,
        backgroundColor: '#4caf50',
      },
      {
        label: 'Deletions',
        data: metrics.activity?.code_frequency?.deletions,
        backgroundColor: '#f44336',
      },
    ],
  };

  const languageDistributionData = {
    labels: Object.keys(metrics.code_quality?.languages || {}),
    datasets: [
      {
        label: 'Lines of Code',
        data: Object.values(metrics.code_quality?.languages || {}),
        backgroundColor: [
          '#4caf50',
          '#f44336',
          '#2196f3',
          '#ffc107',
          '#673ab7',
          '#ff5722',
          '#3f51b5',
          '#009688',
          '#e91e63',
          '#607d8b',
          '#9c27b0',
          '#795548',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Repository Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isLoading ? <Skeleton width={200} /> : `${repository?.owner}/${repository?.name}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{isLoading ? <Skeleton count={3} /> : repository?.description}</p>
        </CardContent>
      </Card>

      {/* Commit Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Commit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton height={250} />
          ) : (
            <Bar data={commitFrequencyData} />
          )}
        </CardContent>
      </Card>

      {/* Language Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Language Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton height={250} />
          ) : (
            <Pie data={languageDistributionData} />
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Issue Resolution Rate</h3>
                <p>{metrics.performance?.issue_resolution_rate}%</p>
              </div>
              <div>
                <h3 className="font-semibold">PR Merge Rate</h3>
                <p>{metrics.performance?.pr_merge_rate}%</p>
              </div>
              <div>
                <h3 className="font-semibold">Median Issue Response Time</h3>
                <p>{metrics.performance?.median_issue_response_time}s</p>
              </div>
              <div>
                <h3 className="font-semibold">Median PR Response Time</h3>
                <p>{metrics.performance?.median_pr_response_time}s</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Community Health</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics.community_health || {}).map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-semibold">{key.replace(/_/g, ' ')}</h3>
                  <p>{value ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
