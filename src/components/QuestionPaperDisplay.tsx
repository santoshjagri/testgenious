
"use client";

import type * as React from 'react';
import type { GenerateQuestionsOutput, GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListOrdered, FileText, FileSignature, Printer, Download } from 'lucide-react';

interface QuestionPaperDisplayProps {
  formData: Omit<GenerateQuestionsInput, 'mcqCount' | 'shortQuestionCount' | 'longQuestionCount'>;
  questions: GenerateQuestionsOutput;
}

export function QuestionPaperDisplay({ formData, questions }: QuestionPaperDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-12">
      <Button onClick={handlePrint} variant="outline" className="mb-6 w-full md:w-auto no-print bg-accent hover:bg-accent/90 text-accent-foreground">
        <Printer className="mr-2 h-5 w-5" />
        Download / Print Question Paper
      </Button>

      <Card className="printable-area shadow-2xl rounded-lg border-2 border-primary/20" id="question-paper">
        <CardHeader className="bg-primary text-primary-foreground p-6 rounded-t-lg">
          <CardTitle className="text-4xl font-headline text-center">Question Paper</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <p><strong className="font-semibold">Class/Level:</strong> {formData.classLevel}</p>
            <p><strong className="font-semibold">Subject:</strong> {formData.subject}</p>
            <p><strong className="font-semibold">Total Marks:</strong> {formData.totalMarks}</p>
            <p><strong className="font-semibold">Pass Marks:</strong> {formData.passMarks}</p>
          </div>
          <p className="mt-2 text-center"><strong className="font-semibold">Time Limit:</strong> {formData.timeLimit}</p>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {formData.instructions && (
            <div className="bg-secondary/30 p-4 rounded-md border border-secondary">
              <h3 className="text-lg font-semibold text-primary mb-2">Instructions:</h3>
              <p className="whitespace-pre-line text-sm">{formData.instructions}</p>
            </div>
          )}

          {questions.mcqs && questions.mcqs.length > 0 && (
            <section aria-labelledby="mcq-section-title">
              <div className="flex items-center mb-4">
                <ListOrdered className="h-7 w-7 mr-3 text-primary" />
                <h2 id="mcq-section-title" className="text-2xl font-headline text-primary">Multiple Choice Questions</h2>
              </div>
              <ul className="space-y-4 list-decimal list-inside pl-2">
                {questions.mcqs.map((mcq, index) => (
                  <li key={`mcq-${index}`} className="text-base mb-2 pb-2 border-b border-dashed">
                    {mcq}
                    <div className="mt-3 space-y-1 text-sm">
                      <p>(A) ____________</p>
                      <p>(B) ____________</p>
                      <p>(C) ____________</p>
                      <p>(D) ____________</p>
                    </div>
                    <div className="mt-4 h-8"> {/* Answer space */} </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Separator className="my-8 border-primary/50" />

          {questions.shortQuestions && questions.shortQuestions.length > 0 && (
            <section aria-labelledby="short-questions-title">
              <div className="flex items-center mb-4">
                <FileText className="h-7 w-7 mr-3 text-primary" />
                <h2 id="short-questions-title" className="text-2xl font-headline text-primary">Short Answer Questions</h2>
              </div>
              <ul className="space-y-6">
                {questions.shortQuestions.map((question, index) => (
                  <li key={`short-${index}`} className="text-base mb-2 pb-2 border-b border-dashed">
                    {index + 1}. {question}
                    <div className="mt-4 h-24 bg-gray-100/50 border border-dashed border-gray-300 rounded-md p-2">
                      {/* Placeholder for answer space */}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Separator className="my-8 border-primary/50" />

          {questions.longQuestions && questions.longQuestions.length > 0 && (
            <section aria-labelledby="long-questions-title">
              <div className="flex items-center mb-4">
                <FileSignature className="h-7 w-7 mr-3 text-primary" />
                <h2 id="long-questions-title" className="text-2xl font-headline text-primary">Long Answer Questions</h2>
              </div>
              <ul className="space-y-8">
                {questions.longQuestions.map((question, index) => (
                  <li key={`long-${index}`} className="text-base mb-2 pb-2">
                     {index + 1}. {question}
                    <div className="mt-4 h-48 bg-gray-100/50 border border-dashed border-gray-300 rounded-md p-2">
                      {/* Placeholder for answer space */}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
        <CardFooter className="p-6 border-t text-center text-muted-foreground text-sm">
          <p>Generated by TestPaperGenius &copy; {new Date().getFullYear()}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
