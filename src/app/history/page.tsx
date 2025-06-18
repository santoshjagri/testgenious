"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";
import type { StoredQuestionPaper } from '@/lib/types'; // Import the new type
import { Button } from '@/components/ui/button'; // For potential future actions

const LOCAL_STORAGE_KEY = "questionPaperHistory";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredQuestionPaper[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load history from local storage:", error);
        // Optionally, display a toast message to the user
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
      if (confirm("Are you sure you want to clear all paper history? This action cannot be undone.")) {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHistoryItems([]);
        } catch (error) {
          console.error("Failed to clear history from local storage:", error);
          // Optionally, display a toast message
        }
      }
    }
  };


  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl md:text-3xl">Paper History</h1>
        {historyItems.length > 0 && (
          <Button variant="destructive" onClick={clearHistory} className="no-print">
            Clear All History
          </Button>
        )}
      </div>
      {historyItems.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <Alert>
              <HistoryIcon className="h-5 w-5" />
              <AlertTitle>No History Yet</AlertTitle>
              <AlertDescription>
                You haven't generated any question papers yet. Go to "Create New Paper" to get started. Your generated papers will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.formSnapshot.subject} - {item.formSnapshot.classLevel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm flex-grow">
                <p><span className="font-medium">Total Marks:</span> {item.formSnapshot.totalMarks}</p>
                <p><span className="font-medium">Pass Marks:</span> {item.formSnapshot.passMarks}</p>
                <p><span className="font-medium">Time:</span> {item.formSnapshot.timeLimit}</p>
                <p><span className="font-medium">MCQs:</span> {item.generatedPaper.mcqs.length}</p>
                <p><span className="font-medium">Short Qs:</span> {item.generatedPaper.shortQuestions.length}</p>
                <p><span className="font-medium">Long Qs:</span> {item.generatedPaper.longQuestions.length}</p>
                <p className="mt-2"><span className="font-medium">Generated:</span> {new Date(item.dateGenerated).toLocaleDateString()} at {new Date(item.dateGenerated).toLocaleTimeString()}</p>
              </CardContent>
              {/* Future: Add buttons for actions like View, Re-edit, Delete single item */}
              {/* Example:
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full">View Paper</Button>
              </CardFooter>
              */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
