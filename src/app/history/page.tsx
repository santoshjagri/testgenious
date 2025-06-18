"use client";

import type * as React from 'react'; // Keep type import if only types are used elsewhere from React
import { useState, useEffect } from 'react'; // Import useState and useEffect directly
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react"; // Renamed to avoid conflict

export default function HistoryPage() {
  // In a real app, you'd fetch history from localStorage, a database, or state management.
  const [historyItems, setHistoryItems] = useState<any[]>([]); // Replace 'any' with your actual paper data type

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-2xl md:text-3xl">Paper History</h1>
      </div>
      {historyItems.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <Alert>
              <HistoryIcon className="h-5 w-5" />
              <AlertTitle>No History Yet</AlertTitle>
              <AlertDescription>
                You haven't generated any question papers yet. Go to "Create New Paper" to get started.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {historyItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.subject} - {item.classLevel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="font-medium">Total Marks:</span> {item.totalMarks}</p>
                <p><span className="font-medium">Pass Marks:</span> {item.passMarks}</p>
                <p><span className="font-medium">Time:</span> {item.timeLimit}</p>
                <p><span className="font-medium">Generated:</span> {new Date(item.dateGenerated).toLocaleDateString()}</p>
                {/* Add a button/link to view/re-edit the paper if needed */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
