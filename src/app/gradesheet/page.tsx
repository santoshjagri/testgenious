
"use client";

import * as React from 'react';
import { GradeSheetForm } from "@/components/gradesheet/GradeSheetForm";
import { GradeSheetDisplay } from "@/components/gradesheet/GradeSheetDisplay";
import type { GradeSheetFormValues, CalculatedGradeSheetResult, StoredGradeSheet } from "@/lib/types";
import { calculateGradeSheet } from "@/lib/gradesheet-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const GRADESHEET_LOCAL_STORAGE_KEY = "gradesheetHistory";

export default function GradesheetPage() {
  const [calculatedResult, setCalculatedResult] = React.useState<CalculatedGradeSheetResult | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: GradeSheetFormValues) => {
    setIsProcessing(true);
    setError(null);
    setCalculatedResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const result = calculateGradeSheet(values);
      setCalculatedResult(result);

      // Save to local storage
      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(GRADESHEET_LOCAL_STORAGE_KEY);
          let existingHistory: StoredGradeSheet[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          
          const newGradeSheetEntry: StoredGradeSheet = {
            id: crypto.randomUUID(), 
            dateGenerated: new Date().toISOString(),
            gradesheetData: result,
          };
          existingHistory = [newGradeSheetEntry, ...existingHistory];
          localStorage.setItem(GRADESHEET_LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 20))); // Keep last 20 entries
          
          toast({
            title: "GradeSheet Generated!",
            description: "The gradesheet has been generated and saved to GS History.",
          });

        } catch (storageError) {
          console.error("Error saving gradesheet to local storage:", storageError);
          toast({
            title: "Warning",
            description: "GradeSheet prepared, but failed to save to GS History.",
            variant: "destructive", 
          });
        }
      }

    } catch (e) {
      console.error("Error processing gradesheet:", e);
      setError("An unexpected error occurred while processing the gradesheet.");
      toast({
        title: "Error Processing Gradesheet",
        description: e instanceof Error ? e.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
              <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">Exam GradeSheet Tool</CardTitle>
            </div>
            <CardDescription className="font-body text-sm sm:text-base">
              Enter student, exam, and subject mark details to generate a comprehensive gradesheet.
              Calculations for total marks, percentage, grade, GPA, and result status will be performed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
             <Alert variant="default" className="mb-4 sm:mb-6 border-accent bg-accent/10 text-accent-foreground">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <AlertTitle className="text-base sm:text-lg">Work in Progress</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  This GradeSheet tool is currently in client-side mode. Data is saved to your browser's local storage.
                  Firebase/Firestore integration for cloud data persistence, enhanced PDF download, and printing features will be added in future updates.
                </AlertDescription>
            </Alert>
            <GradeSheetForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-4 sm:mt-6">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <AlertTitle className="text-base sm:text-lg">Error</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="flex justify-center items-center p-6 sm:p-10 bg-card rounded-lg shadow-md mt-6 sm:mt-8">
            <div className="animate-pulse flex flex-col items-center space-y-2">
              <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-md sm:text-lg text-primary font-medium">Calculating Grades...</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
          </div>
        )}

        {calculatedResult && !isProcessing && (
          <div className="animate-fadeInUp mt-6 sm:mt-8">
            <GradeSheetDisplay result={calculatedResult} />
          </div>
        )}
      </div>
       <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
