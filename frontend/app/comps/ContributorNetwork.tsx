'use client'
import { useRepository } from "@/hooks/useRepository"
import { ForceGraph2D } from "react-force-graph"
import { useTheme } from "next-themes"
import { useCallback, useRef, useEffect } from "react"

export function ContributorNetwork() {
  const { repository } = useRepository()
  const { theme } = useTheme()
  const graphRef = useRef()

  // Transform contributors and their interactions into graph data
  const graphData = {
    nodes: repository.contributors?.map((contributor: any) => ({
      id: contributor.username,
      val: contributor.contributions
    })) || [],
    links: repository.contributor_interactions?.map((interaction: any) => ({
      source: interaction.from,
      target: interaction.to,
      value: interaction.weight
    })) || []
  }

  const nodeColor = theme === 'dark' ? '#fff' : '#000'
  const backgroundColor = theme === 'dark' ? '#1a1b1e' : '#ffffff'

  const handleNodeClick = useCallback((node: any) => {
    // Handle node click - could open a modal with contributor details
    console.log(node)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current) {
        graphRef.current.width = graphRef.current.parentElement.offsetWidth
        graphRef.current.height = graphRef.current.parentElement.offsetHeight
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="h-[400px] w-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={nodeColor}
        linkColor={() => theme === 'dark' ? '#666' : '#ddd'}
        backgroundColor={backgroundColor}
        nodeLabel="id"
        onNodeClick={handleNodeClick}
        linkWidth={1}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        width={window.innerWidth}
        height={400}
      />
    </div>
  )
}
