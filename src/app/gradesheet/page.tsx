
"use client";

import * as React from 'react';
import { GradeSheetForm } from "@/components/gradesheet/GradeSheetForm";
import { GradeSheetDisplay } from "@/components/gradesheet/GradeSheetDisplay";
import type { GradeSheetFormValues, CalculatedGradeSheetResult, StoredGradeSheet, GradeSheetCalculationOutput } from "@/lib/types";
import { calculateGradeSheet } from "@/lib/gradesheet-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, AlertCircle, Download, Printer as PrinterIcon, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GRADESHEET_LOCAL_STORAGE_KEY = "gradesheetHistory";

export default function GradesheetPage() {
  const [calculatedResult, setCalculatedResult] = React.useState<CalculatedGradeSheetResult | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (values: GradeSheetFormValues) => {
    setIsProcessing(true);
    setError(null);
    setCalculatedResult(null);
    try {
      // await new Promise(resolve => setTimeout(resolve, 100)); // Simulate short delay

      const { logo, ...otherFormValues } = values;
      let logoDataUri: string | undefined = undefined;

      if (logo) {
        try {
          logoDataUri = await fileToDataUri(logo);
        } catch (e) {
          console.error("Error converting logo to data URI:", e);
          toast({
            title: "Logo Error",
            description: "Could not process the uploaded logo. Continuing without it.",
            variant: "destructive",
          });
        }
      }
      
      const calculationOutput: GradeSheetCalculationOutput = calculateGradeSheet(values);
      
      const fullResult: CalculatedGradeSheetResult = {
        ...otherFormValues, 
        logoDataUri,      
        ...calculationOutput, 
      };
      
      setCalculatedResult(fullResult);

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(GRADESHEET_LOCAL_STORAGE_KEY);
          let existingHistory: StoredGradeSheet[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          
          const newGradeSheetEntry: StoredGradeSheet = {
            id: crypto.randomUUID(), 
            dateGenerated: new Date().toISOString(),
            gradesheetData: fullResult,
          };
          existingHistory = [newGradeSheetEntry, ...existingHistory];
          localStorage.setItem(GRADESHEET_LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 20))); 
          
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

  const handlePrint = () => {
    if (calculatedResult) {
      window.print();
    } else {
      toast({
        title: "No Gradesheet Available",
        description: "Please generate a gradesheet before trying to print.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!calculatedResult) {
      toast({
        title: "No Gradesheet Available",
        description: "Please generate a gradesheet before trying to download PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloadingPdf(true);
    const paperElement = document.getElementById('gradesheet-printable-area'); 
    
    if (paperElement) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const marginMM = 10; 
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
        
        const safeStudentName = calculatedResult.studentName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';
        const safeExamType = calculatedResult.examType?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'exam';
        const filename = `gradesheet_${safeStudentName}_${safeExamType}.pdf`;
        
        pdf.save(filename);
        toast({
          title: "PDF Downloaded",
          description: "Gradesheet PDF has been successfully downloaded.",
        });

      } catch (error) {
        console.error("Error generating PDF from gradesheet page:", error);
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
                  Enhanced PDF download, and printing features are available.
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
          <>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-6 sm:mt-8 mb-4 sm:mb-6 no-print">
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                  <PrinterIcon className="mr-2 h-4 w-4" /> Print Gradesheet
                </Button>
                <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloadingPdf} className="w-full sm:w-auto">
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
            <div className="animate-fadeInUp">
              <GradeSheetDisplay result={calculatedResult} />
            </div>
          </>
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

