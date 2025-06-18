
"use client";

import * as React from 'react';
import { QuestionPaperForm } from '@/components/QuestionPaperForm';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import type { QuestionPaperFormValues, StoredQuestionPaper, AppGenerateQuestionsInput, QuestionPaperDisplayFormData } from '@/lib/types';
import { generateQuestions, type GenerateQuestionsOutput, type GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const LOCAL_STORAGE_KEY = "questionPaperHistory";

// Helper function to convert File to Data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

    const aiInput: GenerateQuestionsInput = {
      classLevel: values.classLevel,
      subject: values.subject,
      totalMarks: values.totalMarks,
      passMarks: values.passMarks,
      timeLimit: values.timeLimit,
      instructions: values.instructions || 'All questions are compulsory.',
      examType: values.examType || 'Final Examination',
      institutionName: values.institutionName || 'TestPaperGenius Institute',
      institutionAddress: values.institutionAddress || '',
      subjectCode: values.subjectCode || '',
      logoDataUri: logoDataUri, // Pass to AI flow
      mcqCount: values.mcqCount,
      shortQuestionCount: values.shortQuestionCount,
      longQuestionCount: values.longQuestionCount,
      fillInTheBlanksCount: values.fillInTheBlanksCount,
      trueFalseCount: values.trueFalseCount,
      numericalPracticalCount: values.numericalPracticalCount,
    };
    
    const snapshotForStorageAndDisplay: QuestionPaperDisplayFormData = {
      classLevel: values.classLevel,
      subject: values.subject,
      totalMarks: values.totalMarks,
      passMarks: values.passMarks,
      timeLimit: values.timeLimit,
      instructions: values.instructions || 'All questions are compulsory.',
      examType: values.examType || 'Final Examination',
      institutionName: values.institutionName || 'TestPaperGenius Institute',
      institutionAddress: values.institutionAddress || '',
      subjectCode: values.subjectCode || '',
      logoDataUri: logoDataUri, // Store for display and history
    };


    try {
      const result = await generateQuestions(aiInput);
      setGeneratedPaper(result);
      setFormSnapshotForDisplay(snapshotForStorageAndDisplay);
      
      const newPaperEntry: StoredQuestionPaper = {
        id: Date.now().toString(), 
        dateGenerated: new Date().toISOString(),
        formSnapshot: snapshotForStorageAndDisplay, // Save snapshot with logoDataUri
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
            description: "Question paper generated, but failed to save to history.",
            variant: "destructive", 
          });
        }
      }
      
      toast({
        title: "Success!",
        description: "Question paper generated and saved to history.",
        variant: "default", 
      });

    } catch (error) {
      console.error("Error generating question paper:", error);
      let errorMessage = "Failed to generate question paper. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.substring(0, 200); 
      }
      toast({
        title: "Error Generating Paper",
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
              <p className="text-lg text-primary font-medium">Generating your masterpiece...</p>
              <p className="text-sm text-muted-foreground">This might take a moment. The AI is thinking hard!</p>
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
              Fill out the form above to generate your custom question paper. The AI will craft questions based on your specifications, complete with sections and mark allocations.
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
