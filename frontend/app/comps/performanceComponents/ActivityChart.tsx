// components/ActivityChart.js

import { Line } from 'react-chartjs-2';

export default function ActivityChart({ metrics }) {
  const data = {
    labels: metrics.dates,
    datasets: [
      {
        label: 'Commits',
        data: metrics.commit_counts,
        fill: false,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
      },
      {
        label: 'Issues Opened',
        data: metrics.issues_opened,
        fill: false,
        backgroundColor: '#f97316',
        borderColor: '#f97316',
      },
      // Add more datasets as needed
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Activity Over Time</h2>
      <Line data={data} options={options} />
    </div>
  );
}
