
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QuestionPaperForm } from '@/components/QuestionPaperForm';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import type { QuestionPaperFormValues, StoredQuestionPaper, QuestionPaperDisplayFormData, StorableQuestionPaperFormValues } from '@/lib/types';
import { generateQuestions, type GenerateQuestionsOutput, type GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Edit3, RotateCcw, Palette } from "lucide-react";
import { Button } from '@/components/ui/button';
import { fileToDataUri } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const LOCAL_STORAGE_KEY = "questionPaperHistory";
const EDIT_PAPER_ID_KEY = "editPaperId";


const parseManualQuestions = (text?: string): string[] => {
  if (!text || text.trim() === "") return [];
  return text.split('\n').map(q => q.trim()).filter(q => q.length > 0);
};

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPaper, setGeneratedPaper] = React.useState<GenerateQuestionsOutput | null>(null);
  const [formSnapshotForDisplay, setFormSnapshotForDisplay] = React.useState<QuestionPaperDisplayFormData | null>(null);
  const [editingPaperId, setEditingPaperId] = React.useState<string | null>(null);
  const [template, setTemplate] = React.useState('normal');
  const { toast } = useToast();
  const router = useRouter();

  const [initialFormValues, setInitialFormValues] = React.useState<QuestionPaperFormValues | undefined>(undefined);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const paperIdToEdit = localStorage.getItem(EDIT_PAPER_ID_KEY);
      if (paperIdToEdit) {
        try {
          const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedHistory) {
            const historyItems: StoredQuestionPaper[] = JSON.parse(storedHistory);
            const paperToEdit = historyItems.find(item => item.id === paperIdToEdit);

            if (paperToEdit) {
              const formValues: QuestionPaperFormValues = {
                ...paperToEdit.formSnapshot,
                logo: undefined,
              };

              if (paperToEdit.formSnapshot.generationMode === 'manual' && paperToEdit.generatedPaper) {
                const { generatedPaper: gp } = paperToEdit;
                formValues.manualMcqs = gp.mcqs?.join('\n') || "";
                formValues.manualVeryShortQuestions = gp.veryShortQuestions?.join('\n') || "";
                formValues.manualFillInTheBlanks = gp.fillInTheBlanks?.join('\n') || "";
                formValues.manualTrueFalseQuestions = gp.trueFalseQuestions?.join('\n') || "";
                formValues.manualShortQuestions = gp.shortQuestions?.join('\n') || "";
                formValues.manualLongQuestions = gp.longQuestions?.join('\n') || "";
                formValues.manualNumericalPracticalQuestions = gp.numericalPracticalQuestions?.join('\n') || "";
              }

              setInitialFormValues(formValues);
              setGeneratedPaper(paperToEdit.generatedPaper);
              setFormSnapshotForDisplay(paperToEdit.formSnapshot);
              setEditingPaperId(paperToEdit.id);
              toast({
                title: "Editing Paper",
                description: `Loaded paper "${paperToEdit.formSnapshot.subject} - ${paperToEdit.formSnapshot.classLevel}" for editing.`,
              });
            }
          }
        } catch (error) {
          console.error("Failed to load paper for editing:", error);
          toast({
            title: "Error Loading Paper",
            description: "Could not load the selected paper for editing.",
            variant: "destructive",
          });
        } finally {
          localStorage.removeItem(EDIT_PAPER_ID_KEY);
        }
      } else {
        setInitialFormValues(undefined);
        setGeneratedPaper(null);
        setFormSnapshotForDisplay(null);
        setEditingPaperId(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (values: QuestionPaperFormValues) => {
    setIsLoading(true);
    if (!editingPaperId) {
        setGeneratedPaper(null);
        setFormSnapshotForDisplay(null);
    }

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
    } else if (editingPaperId && formSnapshotForDisplay?.logoDataUri) {
      logoDataUri = formSnapshotForDisplay.logoDataUri;
    }

    const storableFormValues: StorableQuestionPaperFormValues = {
      ...values,
      logo: undefined,
      logoDataUri: logoDataUri,
    };

    const displayData: QuestionPaperDisplayFormData = { ...storableFormValues };

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
        if (result.veryShortQuestions?.length === 0) delete result.veryShortQuestions;
        if (result.fillInTheBlanks?.length === 0) delete result.fillInTheBlanks;
        if (result.trueFalseQuestions?.length === 0) delete result.trueFalseQuestions;
        if (result.numericalPracticalQuestions?.length === 0) delete result.numericalPracticalQuestions;

        toast({
          title: editingPaperId ? "Manual Paper Updated" : "Manual Paper Prepared",
          description: "Your manually entered questions are ready.",
        });

      } else {
        const aiInput: GenerateQuestionsInput = {
          classLevel: values.classLevel,
          subject: values.subject,
          totalMarks: values.totalMarks,
          passMarks: values.passMarks,
          timeLimit: values.timeLimit,
          instructions: values.instructions || 'All questions are compulsory.',
          examType: values.examType,
          institutionName: values.institutionName || 'ExamGenius AI Institute',
          institutionAddress: values.institutionAddress || '',
          subjectCode: values.subjectCode || '',
          language: values.language,
          customPrompt: values.customPrompt,
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
          title: editingPaperId ? "AI Paper Updated!" : "Success!",
          description: editingPaperId ? "AI Question paper re-generated and updated in history." : "AI Question paper generated and saved to history.",
        });
      }

      setGeneratedPaper(result);
      setFormSnapshotForDisplay(displayData);

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(LOCAL_STORAGE_KEY);
          let existingHistory: StoredQuestionPaper[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];

          if (editingPaperId) {
            existingHistory = existingHistory.map(item =>
              item.id === editingPaperId
              ? { ...item, formSnapshot: storableFormValues, generatedPaper: result, dateGenerated: new Date().toISOString() }
              : item
            );
          } else {
            const newPaperEntry: StoredQuestionPaper = {
              id: crypto.randomUUID(),
              dateGenerated: new Date().toISOString(),
              formSnapshot: storableFormValues,
              generatedPaper: result,
            };
            existingHistory = [newPaperEntry, ...existingHistory];
          }

          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 20)));
          if (editingPaperId) {
            setEditingPaperId(null);
          }

        } catch (storageError) {
          console.error("Error saving to local storage:", storageError);
          toast({
            title: "Warning",
            description: `Question paper ${editingPaperId ? 'updated' : 'prepared'}, but failed to save to history.`,
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

  const clearFormAndEditState = () => {
    setInitialFormValues(undefined);
    setGeneratedPaper(null);
    setFormSnapshotForDisplay(null);
    setEditingPaperId(null);
    toast({ title: "Form Cleared", description: "Ready for a new paper."});
  };


  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <div className="w-full max-w-4xl space-y-6 sm:space-y-8 md:space-y-12">
        {editingPaperId && (
            <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground mb-4 sm:mb-6 no-print">
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <AlertTitle className="text-base sm:text-lg">Editing Mode</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                You are currently editing a previously saved paper. Make your changes and click "Generate Question Paper" to update it.
                <Button variant="outline" size="sm" onClick={clearFormAndEditState} className="ml-2 sm:ml-4 mt-1 sm:mt-0 text-xs">
                    Create New Instead
                </Button>
                </AlertDescription>
            </Alert>
        )}

        <QuestionPaperForm
            key={editingPaperId || 'new'}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            initialValues={initialFormValues}
        />

        {isLoading && (
          <div className="flex justify-center items-center p-6 sm:p-10 bg-card rounded-lg shadow-md">
            <div className="animate-pulse flex flex-col items-center space-y-2">
              <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-md sm:text-lg text-primary font-medium">Preparing your masterpiece...</p>
              <p className="text-xs sm:text-sm text-muted-foreground">This might take a moment.</p>
            </div>
          </div>
        )}

        {!isLoading && generatedPaper && formSnapshotForDisplay && (
          <div className="animate-fadeInUp">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 no-print my-4 p-4 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="template-select" className="text-sm font-medium">Template</Label>
                    <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger id="template-select" className="w-[180px]">
                        <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="better">Better</SelectItem>
                        <SelectItem value="best">Best</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <QuestionPaperDisplay formData={formSnapshotForDisplay} questions={generatedPaper} template={template} />
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
