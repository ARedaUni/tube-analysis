'use client'

import { useRepository } from "@/hooks/useRepository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { fetchRepositoryMetrics } from "@/services/api"
import { ResponsiveContainer,  Tooltip } from "recharts"

export function LabelAnalysis() {
  const { repository } = useRepository()

  const { data: metric = {}, isLoading, error } = useQuery({
    queryKey: ['metrics', repository?.id],
    queryFn: () => fetchRepositoryMetrics(repository?.id),
    enabled: !!repository?.id,
  })

  const labelEntries = Object.entries(repository.label_stats || {})
  const sortedLabelEntries = labelEntries.sort((a, b) => b[1] - a[1])

  const treeMapData = [{
    name: 'Labels',
    children: sortedLabelEntries.map(([label, count]) => ({
      name: label,
      size: count,
    }))
  }]

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--card))',
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Label Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <TreeMap
                data={treeMapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip />
              </TreeMap>
            </ResponsiveContainer>
          </div> */}
          <div>
            <h3 className="text-lg font-medium mb-3">Label Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {sortedLabelEntries.map(([label, count], index) => (
                <Badge key={label} variant="secondary" className="text-xs py-1 px-2" style={{backgroundColor: COLORS[index % COLORS.length], color: '#fff'}}>
                  {label}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}