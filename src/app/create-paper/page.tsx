
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QuestionPaperForm } from '@/components/QuestionPaperForm';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import type { QuestionPaperFormValues, StoredQuestionPaper, QuestionPaperDisplayFormData, ExamTypes } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Edit, RotateCcw, Palette, History as HistoryIcon, Trash2, Eye, ArrowLeft, PlusSquare, FileQuestion, CalendarDays, Download, Printer as PrinterIcon, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { fileToDataUri } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitleComponent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// AI Flow import is removed
// import { generateQuestions, type GenerateQuestionsOutput, type GenerateQuestionsInput } from '@/ai/flows/generate-questions';
import type { GenerateQuestionsOutput } from '@/ai/flows/generate-questions';


const LOCAL_STORAGE_KEY = "questionPaperHistory";
const EDIT_PAPER_ID_KEY = "editPaperId";

const parseManualQuestions = (text?: string): string[] => {
  if (!text || text.trim() === "") return [];
  return text.split('\n').map(q => q.trim()).filter(q => q.length > 0);
};

export default function CreatePaperPage() {
  // Creator states
  const [isProcessing, setIsProcessing] = React.useState(false); // Renamed from isLoading
  const [generatedPaper, setGeneratedPaper] = React.useState<GenerateQuestionsOutput | null>(null);
  const [formSnapshotForDisplay, setFormSnapshotForDisplay] = React.useState<QuestionPaperDisplayFormData | null>(null);
  const [editingPaperId, setEditingPaperId] = React.useState<string | null>(null);
  const [initialFormValues, setInitialFormValues] = React.useState<QuestionPaperFormValues | undefined>(undefined);
  
  // History states
  const [historyItems, setHistoryItems] = React.useState<StoredQuestionPaper[]>([]);
  const [selectedPaperForView, setSelectedPaperForView] = React.useState<StoredQuestionPaper | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Shared states
  const [template, setTemplate] = React.useState('normal');
  const [activeTab, setActiveTab] = React.useState('creator');
  const { toast } = useToast();
  const router = useRouter();

  // Load history on tab switch
  React.useEffect(() => {
    if (activeTab === 'history' && typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        toast({ title: "Error Loading History", variant: "destructive" });
      }
    }
  }, [activeTab, toast]);

  // Handle editing from localStorage (e.g., legacy links)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const paperIdToEdit = localStorage.getItem(EDIT_PAPER_ID_KEY);
      if (paperIdToEdit) {
        handleEditPaper(paperIdToEdit, true); // From legacy link
        localStorage.removeItem(EDIT_PAPER_ID_KEY);
      }
    }
  }, []);

  const handleEditPaper = (paperId: string, fromLegacyLink = false) => {
    const allHistory = historyItems.length > 0 ? historyItems : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const paperToEdit = allHistory.find((item: StoredQuestionPaper) => item.id === paperId);
    
    if (paperToEdit) {
      const formValues: QuestionPaperFormValues = { ...paperToEdit.formSnapshot, logo: undefined };
      if (paperToEdit.generatedPaper) {
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
      setActiveTab('creator');
      toast({ title: "Editing Paper", description: `Loaded paper "${paperToEdit.formSnapshot.subject}" for editing.` });
      window.scrollTo(0, 0);
    } else if (fromLegacyLink) {
        toast({ title: "Not Found", description: "Paper to edit was not found in history.", variant: "destructive" });
    }
  };


  const handleFormSubmit = async (values: QuestionPaperFormValues) => {
    setIsProcessing(true);
    if (!editingPaperId) {
        setGeneratedPaper(null);
        setFormSnapshotForDisplay(null);
    }
    let logoDataUri: string | undefined = undefined;
    if (values.logo) {
      try { logoDataUri = await fileToDataUri(values.logo); } catch (error) { toast({ title: "Logo Error", variant: "destructive" }); setIsProcessing(false); return; }
    } else if (editingPaperId && formSnapshotForDisplay?.logoDataUri) {
      logoDataUri = formSnapshotForDisplay.logoDataUri;
    }
    const storableFormValues = { ...values, logo: undefined, logoDataUri: logoDataUri };
    const displayData: QuestionPaperDisplayFormData = { ...storableFormValues };
    
    try {
      // Logic now only handles manual mode
      const result: GenerateQuestionsOutput = {
        mcqs: parseManualQuestions(values.manualMcqs),
        veryShortQuestions: parseManualQuestions(values.manualVeryShortQuestions),
        fillInTheBlanks: parseManualQuestions(values.manualFillInTheBlanks),
        trueFalseQuestions: parseManualQuestions(values.manualTrueFalseQuestions),
        shortQuestions: parseManualQuestions(values.manualShortQuestions),
        longQuestions: parseManualQuestions(values.manualLongQuestions),
        numericalPracticalQuestions: parseManualQuestions(values.manualNumericalPracticalQuestions),
      };
      
      // Clean up optional empty arrays
      if (result.veryShortQuestions?.length === 0) delete result.veryShortQuestions;
      if (result.fillInTheBlanks?.length === 0) delete result.fillInTheBlanks;
      if (result.trueFalseQuestions?.length === 0) delete result.trueFalseQuestions;
      if (result.numericalPracticalQuestions?.length === 0) delete result.numericalPracticalQuestions;

      toast({ title: editingPaperId ? "Manual Paper Updated" : "Manual Paper Prepared", description: "Paper saved to history." });
      
      setGeneratedPaper(result);
      setFormSnapshotForDisplay(displayData);

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(LOCAL_STORAGE_KEY);
          let currentHistory: StoredQuestionPaper[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          if (editingPaperId) {
            currentHistory = currentHistory.map(item => item.id === editingPaperId ? { ...item, formSnapshot: storableFormValues, generatedPaper: result, dateGenerated: new Date().toISOString() } : item);
          } else {
            const newPaperEntry: StoredQuestionPaper = { id: crypto.randomUUID(), dateGenerated: new Date().toISOString(), formSnapshot: storableFormValues, generatedPaper: result };
            currentHistory = [newPaperEntry, ...currentHistory];
          }
          const updatedHistory = currentHistory.slice(0, 20);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
          setHistoryItems(updatedHistory);
          if (editingPaperId) setEditingPaperId(null);
        } catch (storageError) {
          console.error("Error saving to local storage:", storageError);
          toast({ title: "Warning", description: "Failed to save to history.", variant: "destructive" });
        }
      }
    } catch (error) {
      let errorMessage = "Failed to process question paper.";
      if (error instanceof Error) errorMessage = error.message.substring(0, 200);
      toast({ title: "Error Processing Paper", description: errorMessage, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFormAndEditState = () => {
    setInitialFormValues(undefined);
    setGeneratedPaper(null);
    setFormSnapshotForDisplay(null);
    setEditingPaperId(null);
    toast({ title: "Form Cleared", description: "Ready for a new paper."});
  };

  // History functions
  const clearHistory = () => {
    if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHistoryItems([]);
          setSelectedPaperForView(null); 
          toast({ title: "History Cleared" });
        } catch (error) {
          toast({ title: "Error Clearing History", variant: "destructive" });
        }
    }
  };

  const deleteSingleItem = (paperId: string) => {
    try {
      const updatedHistory = historyItems.filter(item => item.id !== paperId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
      setHistoryItems(updatedHistory);
      if (selectedPaperForView?.id === paperId) {
        setSelectedPaperForView(null); 
      }
      toast({ title: "Paper Deleted" });
    } catch (error) {
      toast({ title: "Error Deleting Paper", variant: "destructive" });
    }
  };
  
  const handleViewPaper = (item: StoredQuestionPaper) => setSelectedPaperForView(item);
  
  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    const elementId = selectedPaperForView ? 'question-paper-history-view' : 'question-paper';
    const paperElement = document.getElementById(elementId);
    
    if (!paperElement) {
        toast({ title: "PDF Error", description: "Printable element not found.", variant: "destructive" });
        return;
    }

    setIsDownloading(true);
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const marginTopMM = 15, marginBottomMM = 15, marginLeftMM = 12, marginRightMM = 12;
        const contentWidthMM = pdfPageWidth - marginLeftMM - marginRightMM;
        const contentHeightMM = pdfPageHeight - marginTopMM - marginBottomMM;

        const fullCanvas = await html2canvas(paperElement, { scale: 2, useCORS: true, logging: false });
        const fullCanvasWidthPx = fullCanvas.width;
        const fullCanvasHeightPx = fullCanvas.height;
        const pxPerMm = fullCanvasWidthPx / contentWidthMM;
        let pageSliceHeightPx = contentHeightMM * pxPerMm;
        
        let currentYpx = 0;
        let isFirstPage = true;
        while (currentYpx < fullCanvasHeightPx) {
            if (!isFirstPage) {
                pdf.addPage();
            }
            const remainingHeightPx = fullCanvasHeightPx - currentYpx;
            const sliceForThisPagePx = Math.min(pageSliceHeightPx, remainingHeightPx);
            
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = fullCanvasWidthPx;
            pageCanvas.height = sliceForThisPagePx;
            const pageCtx = pageCanvas.getContext('2d');
            if (pageCtx) {
                pageCtx.drawImage(fullCanvas, 0, currentYpx, fullCanvasWidthPx, sliceForThisPagePx, 0, 0, fullCanvasWidthPx, sliceForThisPagePx);
                const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
                const actualContentHeightMMForThisPage = sliceForThisPagePx / pxPerMm;
                pdf.addImage(pageImgData, 'PNG', marginLeftMM, marginTopMM, contentWidthMM, actualContentHeightMMForThisPage);
            }
            currentYpx += pageSliceHeightPx;
            isFirstPage = false;
        }

        const data = selectedPaperForView?.formSnapshot || formSnapshotForDisplay;
        const safeSubject = data?.subject?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'paper';
        const filename = `question_paper_${safeSubject}.pdf`;
        pdf.save(filename);
        toast({ title: "PDF Downloaded" });

    } catch (error) {
        console.error("PDF generation error:", error);
        toast({ title: "PDF Generation Failed", variant: "destructive" });
    } finally {
        setIsDownloading(false);
    }
  };

  if (selectedPaperForView) {
    const displayFormData = { ...selectedPaperForView.formSnapshot, examType: selectedPaperForView.formSnapshot.examType as (typeof ExamTypes)[number] };
    return (
      <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6 no-print">
            <Button variant="outline" onClick={() => setSelectedPaperForView(null)} className="w-full sm:w-auto sm:mr-auto"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Button>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto"><PrinterIcon className="mr-2 h-4 w-4" /> Print Paper</Button>
            <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloading} className="w-full sm:w-auto">
               {isDownloading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Downloading...</>) : (<><Download className="mr-2 h-4 w-4" /> Download PDF</>)}
            </Button>
        </div>
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 no-print my-4 p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center space-x-2"><Palette className="h-4 w-4 text-muted-foreground" /><Label htmlFor="template-select" className="text-sm font-medium">Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger id="template-select" className="w-[180px]"><SelectValue placeholder="Select Template" /></SelectTrigger>
                <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="good">Good</SelectItem><SelectItem value="better">Better</SelectItem><SelectItem value="best">Best</SelectItem></SelectContent>
                </Select>
            </div>
        </div>
        <QuestionPaperDisplay formData={displayFormData} questions={selectedPaperForView.generatedPaper} template={template} printableId="question-paper-history-view" showControls={false} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
        <div className="flex justify-end mb-4">
          <TabsList className="grid w-full sm:w-auto sm:grid-cols-2">
            <TabsTrigger value="creator">Create Paper</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="creator" className="space-y-6 sm:space-y-8 md:space-y-12">
            {editingPaperId && (
                <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground no-print">
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" /><AlertTitle className="text-base sm:text-lg">Editing Mode</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">
                    You are editing a saved paper. Make changes and click "Generate Question Paper" to update.
                    <Button variant="outline" size="sm" onClick={clearFormAndEditState} className="ml-2 sm:ml-4 mt-1 sm:mt-0 text-xs">Create New Instead</Button>
                    </AlertDescription>
                </Alert>
            )}
            <QuestionPaperForm key={editingPaperId || 'new'} onSubmit={handleFormSubmit} isLoading={isProcessing} initialValues={initialFormValues} />
            {isProcessing && (
              <div className="flex justify-center items-center p-6 sm:p-10 bg-card rounded-lg shadow-md">
                <div className="animate-pulse flex flex-col items-center space-y-2">
                  <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <p className="text-md sm:text-lg text-primary font-medium">Preparing your masterpiece...</p>
                </div>
              </div>
            )}
            {!isProcessing && generatedPaper && formSnapshotForDisplay && (
              <div className="animate-fadeInUp">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 no-print my-4 p-4 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center space-x-2"><Palette className="h-4 w-4 text-muted-foreground" /><Label htmlFor="template-select" className="text-sm font-medium">Template</Label>
                        <Select value={template} onValueChange={setTemplate}>
                        <SelectTrigger id="template-select" className="w-[180px]"><SelectValue placeholder="Select Template" /></SelectTrigger>
                        <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="good">Good</SelectItem><SelectItem value="better">Better</SelectItem><SelectItem value="best">Best</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>
                <QuestionPaperDisplay formData={formSnapshotForDisplay} questions={generatedPaper} template={template} />
              </div>
            )}
        </TabsContent>

        <TabsContent value="history">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl flex items-center"><HistoryIcon className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />Paper History</h1>
            {historyItems.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="no-print w-full sm:w-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear All History</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitleComponent>Are you absolutely sure?</AlertDialogTitleComponent><AlertDialogDescription>This will permanently delete all saved question papers.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearHistory}>Yes, clear history</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            )}
          </div>
           {historyItems.length === 0 ? (
            <Card className="mt-4 shadow-md"><CardContent className="pt-6"><Alert className="border-primary/20 bg-primary/5"><HistoryIcon className="h-5 w-5 text-primary" /><AlertTitle className="text-primary text-base sm:text-lg">No History Yet</AlertTitle><AlertDescription className="text-foreground/80 text-xs sm:text-sm">Your generated papers will appear here.</AlertDescription></Alert></CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {historyItems.map((item) => (
                <Card key={item.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
                  <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-primary flex items-center gap-2"><FileQuestion className="h-5 w-5 flex-shrink-0"/><span className="truncate">{item.formSnapshot.subject}</span></CardTitle><p className="text-sm text-muted-foreground pt-1">{item.formSnapshot.classLevel}</p></CardHeader>
                  <CardContent className="space-y-2 text-xs flex-grow py-0 pb-3"><p><strong>Exam:</strong> {item.formSnapshot.examType}</p><p><strong>Marks:</strong> {item.formSnapshot.totalMarks}</p><p><strong>Mode:</strong> <span className="capitalize">{item.formSnapshot.generationMode || 'manual'}</span></p><p className="mt-2 text-xs text-muted-foreground pt-2 border-t flex items-center"><CalendarDays className="h-3 w-3 mr-1.5"/>{new Date(item.dateGenerated).toLocaleDateString()}</p></CardContent>
                  <CardFooter className="border-t p-1 flex justify-around items-center">
                    <Button variant="ghost" size="sm" onClick={() => handleViewPaper(item)} className="text-primary hover:bg-primary/10 flex-1 text-xs h-8"><Eye className="mr-1 h-3 w-3" /> View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditPaper(item.id)} className="text-foreground hover:bg-secondary flex-1 text-xs h-8"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-xs h-8"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitleComponent>Delete Paper?</AlertDialogTitleComponent><AlertDialogDescription>Are you sure you want to delete the paper for "{item.formSnapshot.subject}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSingleItem(item.id)} className="bg-destructive hover:bg-destructive/90">Yes, Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </main>
  );
}
