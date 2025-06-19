
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ClipboardList, Trash2, Eye, ArrowLeft, Download, Printer as PrinterIcon, User, CalendarDays, BookOpen, Percent, Star, PlusCircle, Loader2 } from "lucide-react";
import type { StoredGradeSheet } from '@/lib/types'; 
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
import { GradeSheetDisplay } from '@/components/gradesheet/GradeSheetDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_KEY = "gradesheetHistory";

export default function GradesheetHistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredGradeSheet[]>([]);
  const [selectedGradeSheetForView, setSelectedGradeSheetForView] = useState<StoredGradeSheet | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
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
        console.error("Failed to load gradesheet history from local storage:", error);
        toast({
          title: "Error Loading History",
          description: "Could not load gradesheet history from your browser's storage.",
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
          setSelectedGradeSheetForView(null); 
          toast({
            title: "GS History Cleared",
            description: "All gradesheet history has been cleared.",
          });
        } catch (error) {
          console.error("Failed to clear gradesheet history from local storage:", error);
          toast({
            title: "Error Clearing History",
            description: "Could not clear gradesheet history.",
            variant: "destructive",
          });
        }
    }
  };

  const deleteSingleItem = (gradesheetId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const updatedHistory = historyItems.filter(item => item.id !== gradesheetId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);
        if (selectedGradeSheetForView?.id === gradesheetId) {
          setSelectedGradeSheetForView(null); 
        }
        toast({
          title: "Gradesheet Deleted",
          description: "The selected gradesheet has been removed from history.",
        });
      } catch (error) {
        console.error("Failed to delete item from local storage:", error);
        toast({
          title: "Error Deleting Gradesheet",
          description: "Could not delete the selected gradesheet.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleViewGradeSheet = (item: StoredGradeSheet) => {
    setSelectedGradeSheetForView(item);
  };

  const handlePrint = () => {
    if (selectedGradeSheetForView) {
      window.print();
    } else {
      toast({
        title: "No Gradesheet Selected",
        description: "Please view a gradesheet before trying to print.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedGradeSheetForView) {
      toast({
        title: "No Gradesheet Selected",
        description: "Please view a gradesheet before trying to download PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloadingPdf(true);
    const paperElement = document.getElementById('gradesheet-printable-area'); // This ID is on GradeSheetDisplay
    
    if (paperElement) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const marginMM = 10; // 10mm margin on all sides
        const marginTopMM = marginMM; 
        const marginBottomMM = marginMM;
        const marginLeftMM = marginMM; 
        const marginRightMM = marginMM;

        const contentWidthMM = pdfPageWidth - marginLeftMM - marginRightMM;
        const contentHeightMM = pdfPageHeight - marginTopMM - marginBottomMM;

        const fullCanvas = await html2canvas(paperElement, {
          scale: 2, 
          useCORS: true,
          logging: false,
        });

        const fullCanvasWidthPx = fullCanvas.width;
        const fullCanvasHeightPx = fullCanvas.height;

        const pxPerMm = fullCanvasWidthPx / contentWidthMM; 
        let pageSliceHeightPx = contentHeightMM * pxPerMm * 0.97; // 3% buffer to avoid cutting content

        let currentYpx = 0; 

        while (currentYpx < fullCanvasHeightPx) {
          const remainingHeightPx = fullCanvasHeightPx - currentYpx;
          const sliceForThisPagePx = Math.min(pageSliceHeightPx, remainingHeightPx);

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = fullCanvasWidthPx;
          pageCanvas.height = sliceForThisPagePx;
          const pageCtx = pageCanvas.getContext('2d');

          if (pageCtx) {
            pageCtx.drawImage(
              fullCanvas,
              0, currentYpx, fullCanvasWidthPx, sliceForThisPagePx, 
              0, 0, fullCanvasWidthPx, sliceForThisPagePx 
            );
            const pageImgData = pageCanvas.toDataURL('image/png', 0.9); 
            const actualContentHeightMMForThisPage = (sliceForThisPagePx / pxPerMm);
            pdf.addImage(pageImgData, 'PNG', marginLeftMM, marginTopMM, contentWidthMM, actualContentHeightMMForThisPage);
          }
          currentYpx += sliceForThisPagePx;
          if (currentYpx < fullCanvasHeightPx) {
            pdf.addPage();
          }
        }
        
        const safeStudentName = selectedGradeSheetForView.gradesheetData.studentName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';
        const safeExamType = selectedGradeSheetForView.gradesheetData.examType?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'exam';
        const filename = `gradesheet_${safeStudentName}_${safeExamType}.pdf`;
        
        pdf.save(filename);
        toast({
          title: "PDF Downloaded",
          description: "Gradesheet PDF has been successfully downloaded.",
        });

      } catch (error) {
        console.error("Error generating PDF from history:", error);
        toast({
          title: "PDF Generation Failed",
          description: "Could not generate PDF for the gradesheet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
         toast({
            title: "PDF Generation Error",
            description: "Could not find the gradesheet content to generate PDF.",
            variant: "destructive",
        });
    }
    setIsDownloadingPdf(false);
  };


  if (selectedGradeSheetForView) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="flex flex-wrap gap-2 mb-6 no-print">
            <Button 
              variant="outline" 
              onClick={() => setSelectedGradeSheetForView(null)} 
              className="mr-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to GS History
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <PrinterIcon className="mr-2 h-4 w-4" /> Print Gradesheet
            </Button>
            <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloadingPdf}>
               {isDownloadingPdf ? (
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
        {/* The GradeSheetDisplay component has id="gradesheet-printable-area" on its root Card */}
        <GradeSheetDisplay result={selectedGradeSheetForView.gradesheetData} /> 
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl md:text-3xl flex items-center">
          <ClipboardList className="mr-3 h-8 w-8 text-primary" />
          GS History
        </h1>
        <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/gradesheet')} className="no-print">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Gradesheet
            </Button>
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
                      This action cannot be undone. This will permanently delete all your saved gradesheets from history.
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
              <ClipboardList className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">No Gradesheet History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80">
                You haven't generated any gradesheets yet. Click "Create New Gradesheet" above or go to "Gradesheet" in the sidebar to get started. Your generated gradesheets will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-primary flex items-center"><User className="mr-2 h-5 w-5"/>{item.gradesheetData.studentName}</CardTitle>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{item.gradesheetData.studentClass} - Roll: {item.gradesheetData.rollNo}</p>
                    <p>{item.gradesheetData.examType}</p>
                    <p className="flex items-center"><BookOpen className="h-3 w-3 mr-1"/>{item.gradesheetData.schoolName}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm flex-grow">
                <p className="flex items-center"><Percent className="h-4 w-4 mr-1.5"/><strong>Percentage:</strong> {item.gradesheetData.percentage.toFixed(2)}%</p>
                <p className="flex items-center"><Star className="h-4 w-4 mr-1.5"/><strong>Grade:</strong> {item.gradesheetData.grade} (GPA: {item.gradesheetData.gpa.toFixed(1)})</p>
                <p><strong>Result:</strong> <span className={item.gradesheetData.resultStatus === "Pass" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{item.gradesheetData.resultStatus}</span></p>
                 <p className="mt-3 text-xs text-muted-foreground pt-2 border-t flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1"/> 
                    Generated: {new Date(item.dateGenerated).toLocaleDateString()} at {new Date(item.dateGenerated).toLocaleTimeString()}
                 </p>
              </CardContent>
              <CardFooter className="border-t pt-3 pb-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch">
                <Button variant="ghost" size="sm" onClick={() => handleViewGradeSheet(item)} className="text-primary hover:bg-primary/10 flex-1 text-center">
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-center">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gradesheet?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the gradesheet for "{item.gradesheetData.studentName} - {item.gradesheetData.examType}"? This action cannot be undone.
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

