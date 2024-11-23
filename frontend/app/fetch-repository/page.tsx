'use client'
import React, { useState } from "react";
import { TaskForm } from "../comps/fetchRepo/TaskForm";
import { TaskStatus } from "../comps/fetchRepo/TaskStatus";
import { FancyAnimations } from "../comps/fetchRepo/FancyAnimations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WebSocketUpdates } from "../comps/fetchRepo/WebsocketUpdates";

const FetchRepoPage: React.FC = () => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string | null>(null);

  const handleTaskStart = (id: string, repo: string) => {
    setTaskId(id);
    setRepoName(repo);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">GitHub Repository Data Fetcher</CardTitle>
          <CardDescription className="text-center">Enter a GitHub repository URL to fetch and analyze its data</CardDescription>
        </CardHeader>
        <CardContent>
          {!taskId ? (
            <TaskForm onTaskStart={handleTaskStart} />
          ) : (
            <>
            <TaskStatus taskId={taskId} repoName={repoName!} />
            {/* <WebSocketUpdates taskId={taskId} /> */}
            </>
          )}
        </CardContent>
      </Card>
      <FancyAnimations />
    </div>
  );
};

export default FetchRepoPage;