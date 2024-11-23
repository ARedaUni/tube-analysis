import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface TaskStatusProps {
  taskId: string;
  repoName: string;
}

interface TaskUpdate {
  status: string;
  message: string;
  type?: string; // Task name
}

interface Subtask {
  id: string;
  name: string;
  status: string;
  result: any;
  info: any;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({ taskId, repoName }) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let isPolling = true;

    const fetchTaskStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/task-status/${taskId}/`
        );
        const { status, meta, subtasks } = response.data;

        // Process subtasks
        if (subtasks && Array.isArray(subtasks)) {
          // Update progress
          const totalSubtasks = subtasks.length;
          const completedSubtasks = subtasks.filter(
            (subtask) => subtask.status === "SUCCESS" || subtask.status === "FAILURE"
          ).length;
          const calculatedProgress = (completedSubtasks / totalSubtasks) * 100;
          setProgress(calculatedProgress);

          subtasks.forEach((subtask) => {
            const subtaskUpdate: TaskUpdate = {
              status: subtask.status,
              message: subtask.info ? subtask.info.message : "",
              type: subtask.name,
            };

            // Update or add subtask updates without duplicates
            setUpdates((prev) => {
              const existingUpdateIndex = prev.findIndex(
                (update) => update.type === subtaskUpdate.type
              );
              if (existingUpdateIndex !== -1) {
                const existingUpdate = prev[existingUpdateIndex];
                if (
                  existingUpdate.status !== subtaskUpdate.status ||
                  existingUpdate.message !== subtaskUpdate.message
                ) {
                  const newUpdates = [...prev];
                  newUpdates[existingUpdateIndex] = subtaskUpdate;
                  return newUpdates;
                } else {
                  return prev;
                }
              } else {
                return [...prev, subtaskUpdate];
              }
            });
          });

          // Check if all subtasks are completed
          if (completedSubtasks === totalSubtasks) {
            setCompleted(true);
            isPolling = false;
          }
        } else {
          // No subtasks, update progress based on main task status
          if (status === "SUCCESS" || status === "FAILURE") {
            setProgress(100);
            setCompleted(true);
            isPolling = false;
          }
        }
      } catch (error) {
        console.error("Error fetching task status:", error);
        setUpdates((prev) => [
          ...prev,
          {
            status: "ERROR",
            message: "Unable to fetch task status. Please try again.",
            type: "Error",
          },
        ]);
        isPolling = false;
      }
    };

    // Start polling
    const interval = setInterval(() => {
      if (isPolling) {
        fetchTaskStatus();
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval); // Cleanup
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
              {update.status === "SUCCESS" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {update.status === "FAILURE" && <XCircle className="h-4 w-4" />}
              {update.status !== "SUCCESS" &&
                update.status !== "FAILURE" &&
                update.status !== "ERROR" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              <AlertTitle>
                {update.type || "Task"} - {update.status}
              </AlertTitle>
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
            <AlertTitle>All Tasks Completed</AlertTitle>
            <AlertDescription>
              Check the repository stats for detailed information.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
};
