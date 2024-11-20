// components/PerformanceMetrics.js

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PerformanceMetrics({ metrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Issue Resolution Rate</h3>
            <p>{metrics.issue_resolution_rate}%</p>
          </div>
          <div>
            <h3 className="font-semibold">PR Merge Rate</h3>
            <p>{metrics.pr_merge_rate}%</p>
          </div>
          {/* Add more metrics */}
        </div>
      </CardContent>
    </Card>
  );
}
