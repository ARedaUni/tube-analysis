'use client'
import { useRepository } from "@/hooks/useRepository"
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'

export function DependencyGraph() {
  const { repository } = useRepository()
  
  const dependencies = repository.dependencies || {}
  
  // Transform dependencies into treemap data
  const data = {
    name: 'dependencies',
    children: Object.entries(dependencies).map(([category, deps]) => ({
      name: category,
      children: Object.entries(deps as Record<string, string>).map(([name, version]) => ({
        name,
        size: 1,
        version
      }))
    }))
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded p-2">
          <p>{data.name}</p>
          {data.version && <p>Version: {data.version}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4/3}
          stroke="#fff"
          fill="#8884d8"
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}