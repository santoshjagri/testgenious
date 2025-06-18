
"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { History as HistoryIcon, Eye, Trash2, Download } from "lucide-react";
import type { StoredQuestionPaper } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


const LOCAL_STORAGE_KEY = "questionPaperHistory";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredQuestionPaper[]>([]);
  const [selectedPaperForView, setSelectedPaperForView] = useState<StoredQuestionPaper | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load history from local storage:", error);
        toast({
          title: "Error Loading History",
          description: "Could not load paper history from your browser's storage.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHistoryItems([]);
          toast({
            title: "History Cleared",
            description: "All question paper history has been cleared.",
          });
        } catch (error) {
          console.error("Failed to clear history from local storage:", error);
          toast({
            title: "Error Clearing History",
            description: "Could not clear paper history.",
            variant: "destructive",
          });
        }
    }
  };

  const deleteSingleItem = (paperId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const updatedHistory = historyItems.filter(item => item.id !== paperId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);
        toast({
          title: "Paper Deleted",
          description: "The selected question paper has been removed from history.",
        });
      } catch (error) {
        console.error("Failed to delete item from local storage:", error);
        toast({
          title: "Error Deleting Paper",
          description: "Could not delete the selected paper.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Placeholder - In a real app, this would likely navigate to the main page
  // and pre-fill the form with data from `item.formSnapshot`
  const handleReEdit = (item: StoredQuestionPaper) => {
    toast({
        title: "Re-edit Clicked (Demo)",
        description: `Paper: ${item.formSnapshot.subject} - ${item.formSnapshot.classLevel}. This would pre-fill the form.`,
    });
    // Example: router.push(`/?edit=${item.id}`); // You'd need to implement query param handling
  };

  // Placeholder - This would trigger a download/print of the selected paper
  // You might reuse/adapt the QuestionPaperDisplay component or its logic
  const handleDownloadPrint = (item: StoredQuestionPaper) => {
     toast({
        title: "Download/Print Clicked (Demo)",
        description: `Paper: ${item.formSnapshot.subject} - ${item.formSnapshot.classLevel}. This would prepare the paper for printing.`,
    });
    // Potentially set this paper as active and use a global print function
    // or render it in a modal for printing.
  };


  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl md:text-3xl flex items-center">
          <HistoryIcon className="mr-3 h-8 w-8 text-primary" />
          Paper History
        </h1>
        {historyItems.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="no-print">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your saved question papers from history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Yes, clear history</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {historyItems.length === 0 ? (
        <Card className="mt-4 shadow-md">
          <CardContent className="pt-6">
            <Alert className="border-primary/20 bg-primary/5">
              <HistoryIcon className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">No History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80">
                You haven't generated any question papers yet. Go to "Create New Paper" to get started. Your generated papers will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-primary">{item.formSnapshot.subject} - {item.formSnapshot.classLevel}</CardTitle>
                <p className="text-xs text-muted-foreground">{item.formSnapshot.examType || 'General Paper'}</p>
              </CardHeader>
              <CardContent className="space-y-1 text-sm flex-grow">
                <p><span className="font-medium">Total Marks:</span> {item.formSnapshot.totalMarks}</p>
                <p><span className="font-medium">Pass Marks:</span> {item.formSnapshot.passMarks}</p>
                <p><span className="font-medium">Time:</span> {item.formSnapshot.timeLimit}</p>
                <hr className="my-2"/>
                <p className="text-xs text-muted-foreground">Question Counts:</p>
                <div className="grid grid-cols-2 gap-x-2 text-xs">
                  <p><span className="font-medium">MCQs:</span> {item.generatedPaper.mcqs.length}</p>
                  {item.generatedPaper.fillInTheBlanks && <p><span className="font-medium">Fill Blanks:</span> {item.generatedPaper.fillInTheBlanks.length}</p>}
                  {item.generatedPaper.trueFalseQuestions && <p><span className="font-medium">True/False:</span> {item.generatedPaper.trueFalseQuestions.length}</p>}
                  <p><span className="font-medium">Short Qs:</span> {item.generatedPaper.shortQuestions.length}</p>
                  <p><span className="font-medium">Long Qs:</span> {item.generatedPaper.longQuestions.length}</p>
                  {item.generatedPaper.numericalPracticalQuestions && <p><span className="font-medium">Numerical:</span> {item.generatedPaper.numericalPracticalQuestions.length}</p>}
                </div>
                 <p className="mt-3 text-xs text-muted-foreground pt-2 border-t"><span className="font-medium">Generated:</span> {new Date(item.dateGenerated).toLocaleDateString()} at {new Date(item.dateGenerated).toLocaleTimeString()}</p>
              </CardContent>
              <CardFooter className="border-t pt-3 pb-3 grid grid-cols-2 gap-2">
                {/* <Button variant="outline" size="sm" onClick={() => handleReEdit(item)}>
                  <Eye className="mr-1 h-3 w-3" /> View/Re-edit
                </Button> */}
                <Button variant="ghost" size="sm" onClick={() => handleDownloadPrint(item)} className="text-primary hover:bg-primary/10">
                  <Download className="mr-1 h-3 w-3" /> Download/Print
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Paper?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the paper for "{item.formSnapshot.subject} - {item.formSnapshot.classLevel}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSingleItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
