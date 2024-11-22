import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TaskStatusProps {
  taskId: string;
  repoName: string;
}

interface TaskUpdate {
  status: string;
  message: string;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({ taskId, repoName }) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/task-status/${taskId}/`);
        const { status, result } = response.data;

        setUpdates((prev) => [...prev, { status, message: result || `Task is ${status}` }]);

        if (status === "SUCCESS" || status === "FAILURE") {
          setCompleted(true);
          clearInterval(interval);
          setProgress(100);
        } else {
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      } catch (error) {
        console.error("Error fetching task status:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Fetching data for {repoName}</h2>
      <Progress value={progress} className="w-full" />
      <div className="space-y-2">
        {updates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              variant={update.status === "FAILURE" ? "destructive" : "default"}
            >
              {update.status === "SUCCESS" && <CheckCircle2 className="h-4 w-4" />}
              {update.status === "FAILURE" && <XCircle className="h-4 w-4" />}
              {update.status !== "SUCCESS" && update.status !== "FAILURE" && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertTitle>{update.status}</AlertTitle>
              <AlertDescription>{update.message}</AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </div>
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Task Completed</AlertTitle>
            <AlertDescription>Check the repository stats for detailed information.</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
};