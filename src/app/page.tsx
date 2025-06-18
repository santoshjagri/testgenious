
"use client";

import * as React from 'react';
import { QuestionPaperForm } from '@/components/QuestionPaperForm';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import type { QuestionPaperFormValues, StoredQuestionPaper, QuestionPaperDisplayFormData, AppGenerateQuestionsInput } from '@/lib/types'; // Updated import
import { generateQuestions, type GenerateQuestionsOutput, type GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const LOCAL_STORAGE_KEY = "questionPaperHistory";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const parseManualQuestions = (text?: string): string[] => {
  if (!text || text.trim() === "") return [];
  return text.split('\n').map(q => q.trim()).filter(q => q.length > 0);
};

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPaper, setGeneratedPaper] = React.useState<GenerateQuestionsOutput | null>(null);
  const [formSnapshotForDisplay, setFormSnapshotForDisplay] = React.useState<QuestionPaperDisplayFormData | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: QuestionPaperFormValues) => {
    setIsLoading(true);
    setGeneratedPaper(null); 
    setFormSnapshotForDisplay(null);

    let logoDataUri: string | undefined = undefined;
    if (values.logo) {
      try {
        logoDataUri = await fileToDataUri(values.logo);
      } catch (error) {
        console.error("Error converting logo to data URI:", error);
        toast({
          title: "Logo Error",
          description: "Could not process the uploaded logo. Please try a different image.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    // Use AppGenerateQuestionsInput for the snapshot to include new fields
    const snapshotForStorageAndDisplay: AppGenerateQuestionsInput = {
      classLevel: values.classLevel,
      subject: values.subject,
      totalMarks: values.totalMarks,
      passMarks: values.passMarks,
      timeLimit: values.timeLimit,
      instructions: values.instructions || 'All questions are compulsory.',
      examType: values.examType, // examType is now from enum
      institutionName: values.institutionName || 'TestPaperGenius Institute',
      institutionAddress: values.institutionAddress || '',
      subjectCode: values.subjectCode || '',
      logoDataUri: logoDataUri,
      language: values.language,
      totalQuestionNumber: values.totalQuestionNumber, // New field
      customPrompt: values.customPrompt, // New field
      // AI counts are not part of AppGenerateQuestionsInput directly for snapshot if it's generic
      // but will be used for AIInput if mode is 'ai'
    };
    
    // Explicitly cast to QuestionPaperDisplayFormData for the display component if types differ
    const displayData: QuestionPaperDisplayFormData = {
        ...snapshotForStorageAndDisplay,
        // ensure all required fields for QuestionPaperDisplayFormData are present
    };


    try {
      let result: GenerateQuestionsOutput;

      if (values.generationMode === 'manual') {
        result = {
          mcqs: parseManualQuestions(values.manualMcqs),
          veryShortQuestions: parseManualQuestions(values.manualVeryShortQuestions),
          fillInTheBlanks: parseManualQuestions(values.manualFillInTheBlanks),
          trueFalseQuestions: parseManualQuestions(values.manualTrueFalseQuestions),
          shortQuestions: parseManualQuestions(values.manualShortQuestions),
          longQuestions: parseManualQuestions(values.manualLongQuestions),
          numericalPracticalQuestions: parseManualQuestions(values.manualNumericalPracticalQuestions),
        };
        // Ensure optional arrays are omitted if empty, consistent with AI output
        if (result.veryShortQuestions?.length === 0) delete result.veryShortQuestions;
        if (result.fillInTheBlanks?.length === 0) delete result.fillInTheBlanks;
        if (result.trueFalseQuestions?.length === 0) delete result.trueFalseQuestions;
        if (result.numericalPracticalQuestions?.length === 0) delete result.numericalPracticalQuestions;
        
        toast({
          title: "Manual Paper Prepared",
          description: "Your manually entered questions are ready for display.",
          variant: "default",
        });

      } else { // AI Generation mode
        const aiInput: GenerateQuestionsInput = {
          classLevel: values.classLevel,
          subject: values.subject,
          totalMarks: values.totalMarks,
          passMarks: values.passMarks,
          timeLimit: values.timeLimit,
          instructions: values.instructions || 'All questions are compulsory.',
          examType: values.examType, // Use enum value
          institutionName: values.institutionName || 'TestPaperGenius Institute',
          institutionAddress: values.institutionAddress || '',
          subjectCode: values.subjectCode || '',
          logoDataUri: logoDataUri,
          language: values.language, // Use enum value
          totalQuestionNumber: values.totalQuestionNumber, // New field
          customPrompt: values.customPrompt, // New field
          mcqCount: values.mcqCount,
          veryShortQuestionCount: values.veryShortQuestionCount,
          shortQuestionCount: values.shortQuestionCount,
          longQuestionCount: values.longQuestionCount,
          fillInTheBlanksCount: values.fillInTheBlanksCount,
          trueFalseCount: values.trueFalseCount,
          numericalPracticalCount: values.numericalPracticalCount,
        };
        result = await generateQuestions(aiInput);
        toast({
          title: "Success!",
          description: "AI Question paper generated and saved to history.",
          variant: "default", 
        });
      }
      
      setGeneratedPaper(result);
      setFormSnapshotForDisplay(displayData); // Use displayData for the display component
      
      const newPaperEntry: StoredQuestionPaper = {
        id: Date.now().toString(), 
        dateGenerated: new Date().toISOString(),
        formSnapshot: { // Ensure this matches the StoredQuestionPaper.formSnapshot structure
          classLevel: snapshotForStorageAndDisplay.classLevel,
          subject: snapshotForStorageAndDisplay.subject,
          totalMarks: snapshotForStorageAndDisplay.totalMarks,
          passMarks: snapshotForStorageAndDisplay.passMarks,
          timeLimit: snapshotForStorageAndDisplay.timeLimit,
          instructions: snapshotForStorageAndDisplay.instructions,
          examType: snapshotForStorageAndDisplay.examType,
          institutionName: snapshotForStorageAndDisplay.institutionName,
          institutionAddress: snapshotForStorageAndDisplay.institutionAddress,
          subjectCode: snapshotForStorageAndDisplay.subjectCode,
          logoDataUri: snapshotForStorageAndDisplay.logoDataUri,
          language: snapshotForStorageAndDisplay.language,
          totalQuestionNumber: snapshotForStorageAndDisplay.totalQuestionNumber,
          customPrompt: snapshotForStorageAndDisplay.customPrompt,
          generationMode: values.generationMode,
        },
        generatedPaper: result,
      };

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(LOCAL_STORAGE_KEY);
          const existingHistory: StoredQuestionPaper[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          const updatedHistory = [newPaperEntry, ...existingHistory];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory.slice(0, 20))); 
        } catch (storageError) {
          console.error("Error saving to local storage:", storageError);
          toast({
            title: "Warning",
            description: "Question paper prepared, but failed to save to history.",
            variant: "destructive", 
          });
        }
      }

    } catch (error) {
      console.error("Error during paper processing:", error);
      let errorMessage = "Failed to process question paper. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.substring(0, 200); 
      }
      toast({
        title: "Error Processing Paper",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <div className="w-full max-w-4xl space-y-12">
        <QuestionPaperForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {isLoading && (
          <div className="flex justify-center items-center p-10 bg-card rounded-lg shadow-md">
            <div className="animate-pulse flex flex-col items-center space-y-2">
              <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-primary font-medium">Preparing your masterpiece...</p>
              <p className="text-sm text-muted-foreground">This might take a moment.</p>
            </div>
          </div>
        )}

        {!isLoading && generatedPaper && formSnapshotForDisplay && (
          <div className="animate-fadeInUp">
            <QuestionPaperDisplay formData={formSnapshotForDisplay} questions={generatedPaper} />
          </div>
        )}

        {!isLoading && !generatedPaper && (
           <Alert className="mt-8 border-primary/30 bg-primary/5 text-primary no-print">
            <Terminal className="h-5 w-5" />
            <AlertTitle className="font-headline">Welcome to TestPaperGenius!</AlertTitle>
            <AlertDescription>
              Fill out the form above to generate or manually create your custom question paper. The AI can craft questions, or you can write your own!
            </AlertDescription>
          </Alert>
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

