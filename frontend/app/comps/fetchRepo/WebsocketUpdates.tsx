// src/components/WebSocketUpdates.tsx
import React, { useEffect, useState } from "react";

interface WebSocketUpdatesProps {
  taskId: string;
}

interface WebSocketMessage {
  status: string;
  message: string;
  type: string; // Add this to handle the task type
}

export const WebSocketUpdates: React.FC<WebSocketUpdatesProps> = ({ taskId }) => {
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  
    useEffect(() => {
      const socket = new WebSocket("ws://localhost:8000/ws/task-updates/");
  
      socket.onopen = () => {
        console.log("WebSocket connected.");
      };
  
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };
  
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      socket.onclose = () => {
        console.log("WebSocket closed.");
      };
  
      return () => socket.close();
    }, []);
  
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Task Updates for {taskId}</h3>
        {messages.map((message, index) => (
          <div
            key={index}
            className="bg-gray-100 border-l-4 border-blue-500 p-2 rounded-md shadow-sm"
          >
            <strong>{message.type}</strong> {/* Show the task type */}
            <div>
              <strong>Status:</strong> {message.status}
            </div>
            <div>
              <strong>Message:</strong> {message.message}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
