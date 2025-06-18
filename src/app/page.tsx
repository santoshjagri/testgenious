"use client";

import * as React from 'react';
import { QuestionPaperForm } from '@/components/QuestionPaperForm';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import type { QuestionPaperFormValues } from '@/lib/types';
import { generateQuestions, type GenerateQuestionsOutput, type GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPaper, setGeneratedPaper] = React.useState<GenerateQuestionsOutput | null>(null);
  const [formSnapshot, setFormSnapshot] = React.useState<Omit<GenerateQuestionsInput, 'mcqCount' | 'shortQuestionCount' | 'longQuestionCount'> | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: QuestionPaperFormValues) => {
    setIsLoading(true);
    setGeneratedPaper(null); // Clear previous paper

    const aiInput: GenerateQuestionsInput = {
      classLevel: values.classLevel,
      subject: values.subject,
      totalMarks: values.totalMarks,
      passMarks: values.passMarks,
      timeLimit: values.timeLimit,
      instructions: values.instructions || '',
      mcqCount: values.mcqCount,
      shortQuestionCount: values.shortQuestionCount,
      longQuestionCount: values.longQuestionCount,
    };

    try {
      const result = await generateQuestions(aiInput);
      setGeneratedPaper(result);
      const { mcqCount, shortQuestionCount, longQuestionCount, ...restOfInput } = aiInput;
      setFormSnapshot(restOfInput);
      
      toast({
        title: "Success!",
        description: "Question paper generated successfully.",
        variant: "default", 
      });

    } catch (error) {
      console.error("Error generating question paper:", error);
      toast({
        title: "Error",
        description: "Failed to generate question paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 lg:p-24 bg-gradient-to-br from-background to-blue-50/50">
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
              <p className="text-sm text-muted-foreground">This might take a moment.</p>
            </div>
          </div>
        )}

        {!isLoading && generatedPaper && formSnapshot && (
          <div className="animate-fadeInUp">
            <QuestionPaperDisplay formData={formSnapshot} questions={generatedPaper} />
          </div>
        )}

        {!isLoading && !generatedPaper && (
           <Alert className="mt-8 border-primary/30 bg-primary/5 text-primary no-print">
            <Terminal className="h-5 w-5" />
            <AlertTitle className="font-headline">Welcome to TestPaperGenius!</AlertTitle>
            <AlertDescription>
              Fill out the form above to generate your custom question paper. The AI will craft questions based on your specifications.
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
