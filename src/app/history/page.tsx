
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { History as HistoryIcon, Trash2, Eye, ArrowLeft, PlusSquare, FileQuestion, CalendarDays, Palette, Loader2, Download, Printer as PrinterIcon } from "lucide-react";
import type { StoredQuestionPaper, ExamTypes } from '@/lib/types'; 
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
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_KEY = "questionPaperHistory";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredQuestionPaper[]>([]);
  const [selectedPaperForView, setSelectedPaperForView] = useState<StoredQuestionPaper | null>(null);
  const [template, setTemplate] = useState('normal');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
          setSelectedPaperForView(null); 
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
        if (selectedPaperForView?.id === paperId) {
          setSelectedPaperForView(null); 
        }
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
  
  const handleViewPaper = (item: StoredQuestionPaper) => {
    setSelectedPaperForView(item);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!selectedPaperForView) {
        toast({ title: "No Paper Selected", description: "Please view a paper before downloading.", variant: "destructive" });
        return;
    }

    setIsDownloading(true);
    const paperElement = document.getElementById('question-paper-history-view');
    
    if (paperElement) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const marginTopMM = 20, marginBottomMM = 20, marginLeftMM = 15, marginRightMM = 15;
        const contentWidthMM = pdfPageWidth - marginLeftMM - marginRightMM;
        const contentHeightMM = pdfPageHeight - marginTopMM - marginBottomMM;
        const fullCanvas = await html2canvas(paperElement, { scale: 2, useCORS: true, logging: false });
        const fullCanvasWidthPx = fullCanvas.width;
        const fullCanvasHeightPx = fullCanvas.height;
        const pxPerMm = fullCanvasWidthPx / contentWidthMM; 
        let pageSliceHeightPx = contentHeightMM * pxPerMm * 0.97; 
        let currentYpx = 0; 
        while (currentYpx < fullCanvasHeightPx) {
          const remainingHeightPx = fullCanvasHeightPx - currentYpx;
          const sliceForThisPagePx = Math.min(pageSliceHeightPx, remainingHeightPx);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = fullCanvasWidthPx;
          pageCanvas.height = sliceForThisPagePx;
          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.drawImage(fullCanvas, 0, currentYpx, fullCanvasWidthPx, sliceForThisPagePx, 0, 0, fullCanvasWidthPx, sliceForThisPagePx );
            const pageImgData = pageCanvas.toDataURL('image/png', 0.9); 
            const actualContentHeightMMForThisPage = (sliceForThisPagePx / pxPerMm);
            if (currentYpx > 0) pdf.addPage();
            pdf.addImage(pageImgData, 'PNG', marginLeftMM, marginTopMM, contentWidthMM, actualContentHeightMMForThisPage);
          }
          currentYpx += pageSliceHeightPx;
        }
        const {formSnapshot} = selectedPaperForView;
        const safeSubject = formSnapshot.subject?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'paper';
        const safeClassLevel = formSnapshot.classLevel?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'level';
        const filename = `question_paper_${safeSubject}_${safeClassLevel}.pdf`;
        pdf.save(filename);
        toast({ title: "PDF Downloaded", description: "Paper has been successfully downloaded." });
      } catch (error) {
        console.error("Error generating PDF from history:", error);
        toast({ title: "PDF Generation Failed", variant: "destructive" });
      }
    } else {
        toast({ title: "PDF Generation Error", description: "Could not find the paper content to generate PDF.", variant: "destructive" });
    }
    setIsDownloading(false);
  };


  if (selectedPaperForView) {
    const displayFormData = {
        ...selectedPaperForView.formSnapshot,
        examType: selectedPaperForView.formSnapshot.examType as (typeof ExamTypes)[number], 
    };

    return (
      <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6 no-print">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPaperForView(null)} 
              className="w-full sm:w-auto sm:mr-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
            </Button>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                <PrinterIcon className="mr-2 h-4 w-4" /> Print Paper
            </Button>
            <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloading} className="w-full sm:w-auto">
               {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </>
              )}
            </Button>
        </div>

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
        <QuestionPaperDisplay 
          formData={displayFormData} 
          questions={selectedPaperForView.generatedPaper} 
          template={template}
          printableId="question-paper-history-view"
          showControls={false}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-2 sm:p-4 md:gap-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl flex items-center">
          <HistoryIcon className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Paper History
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button onClick={() => router.push('/')} className="no-print w-full sm:w-auto">
              <PlusSquare className="mr-2 h-4 w-4" /> Create New Paper
            </Button>
            {historyItems.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="no-print w-full sm:w-auto">
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
      </div>
      {historyItems.length === 0 ? (
        <Card className="mt-4 shadow-md">
          <CardContent className="pt-6">
            <Alert className="border-primary/20 bg-primary/5">
              <HistoryIcon className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary text-base sm:text-lg">No History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80 text-xs sm:text-sm">
                You haven't generated or manually created any question papers yet. Click "Create New Paper" above or go to "Create New Paper" in the sidebar to get started. Your papers will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 flex-shrink-0"/>
                    <span className="truncate">{item.formSnapshot.subject}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground pt-1">{item.formSnapshot.classLevel}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs flex-grow py-0 pb-3">
                <p><strong>Exam:</strong> {item.formSnapshot.examType}</p>
                <p><strong>Marks:</strong> {item.formSnapshot.totalMarks}</p>
                <p><strong>Mode:</strong> <span className="capitalize">{item.formSnapshot.generationMode}</span></p>
                <p className="mt-2 text-xs text-muted-foreground pt-2 border-t flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1.5"/>
                    {new Date(item.dateGenerated).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="border-t p-1 flex justify-around items-center">
                <Button variant="ghost" size="sm" onClick={() => handleViewPaper(item)} className="text-primary hover:bg-primary/10 flex-1 text-xs h-8">
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-xs h-8">
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
