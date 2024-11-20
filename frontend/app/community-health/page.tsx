'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHealthAndQuality } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Skeleton from 'react-loading-skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useRepository } from '@/hooks/useRepository';

const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ffc107'];

export default function AnalyticsPage() {
  
  const {repository} = useRepository();
  const { data: data={}, isLoading, error } = useQuery({
    queryKey: ['healthAndQuality', repository?.id],
    queryFn: () => fetchHealthAndQuality(repository?.id),
    enabled: !!repository?.id,
  });

  if (isLoading) {
    return <Skeleton count={5} height={200} />;
  }

  if (error) {
    return <div>Error loading data. Please try again later.</div>;
  }
data && console.log(data)
  const { community_health, timeline_data, issue_data, pr_data, growth_metrics, contributors } = data;

  return (
    <div className="space-y-6">
      {data && (
        <>
          {/* Community Health */}
          <Card>
            <CardHeader>
              <CardTitle>Community Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {community_health &&
                  Object.entries(community_health).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-4 rounded ${
                        value ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <p className="font-semibold">{key.replace(/_/g, ' ')}</p>
                      <p>{value ? 'Available' : 'Not Available'}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
  
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline_data?.dates?.length > 0 ? (
                <BarChart
                  width={600}
                  height={300}
                  data={timeline_data.dates.map((date, idx) => ({
                    date,
                    issues_opened: timeline_data.issues_opened[idx],
                    issues_closed: timeline_data.issues_closed[idx],
                    prs_opened: timeline_data.prs_opened[idx],
                    prs_merged: timeline_data.prs_merged[idx],
                  }))}
                >
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="issues_opened" fill="#4caf50" />
                  <Bar dataKey="issues_closed" fill="#f44336" />
                  <Bar dataKey="prs_opened" fill="#2196f3" />
                  <Bar dataKey="prs_merged" fill="#ffc107" />
                </BarChart>
              ) : (
                <p>No timeline data available.</p>
              )}
            </CardContent>
          </Card>
  
          {/* Issue and PR Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Issue & PR Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3>Open Issues</h3>
                  <p>{issue_data?.open_issues ?? 'N/A'}</p>
                </div>
                <div>
                  <h3>Closed Issues</h3>
                  <p>{issue_data?.closed_issues ?? 'N/A'}</p>
                </div>
                <div>
                  <h3>Average Close Time</h3>
                  <p>
                    {issue_data?.avg_close_time
                      ? `${Math.round(issue_data.avg_close_time / 3600)} hours`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3>Merge Rate</h3>
                  <p>{pr_data?.merge_rate ? `${pr_data.merge_rate}%` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
  
          {/* Growth Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {growth_metrics ? (
                <LineChart
                  width={600}
                  height={300}
                  data={[
                    { name: 'Stars', value: growth_metrics.star_growth_rate },
                    { name: 'Forks', value: growth_metrics.fork_growth_rate },
                    { name: 'Contributors', value: growth_metrics.contributor_growth_rate },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4caf50" />
                </LineChart>
              ) : (
                <p>No growth metrics available.</p>
              )}
            </CardContent>
          </Card>
  
          {/* Contributor Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              {contributors?.length > 0 ? (
                <BarChart
                  width={600}
                  height={300}
                  data={contributors}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="contributions" fill="#4caf50" />
                </BarChart>
              ) : (
                <p>No contributor data available.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
  
}
