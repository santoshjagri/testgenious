
"use client";

import * as React from 'react';
import { GradeSheetForm } from "@/components/gradesheet/GradeSheetForm";
import { GradeSheetDisplay } from "@/components/gradesheet/GradeSheetDisplay";
import type { GradeSheetFormValues, CalculatedGradeSheetResult, StoredGradeSheet, GradeSheetCalculationOutput, SubjectMarkInput, BulkGradeSheetFormValues } from "@/lib/types";
import { calculateGradeSheet } from "@/lib/gradesheet-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, AlertCircle, Download, Printer as PrinterIcon, Loader2, Edit3, RotateCcw, Users, User, Palette } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BulkGradeSheetForm } from '@/components/gradesheet/BulkGradeSheetForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GRADESHEET_LOCAL_STORAGE_KEY = "gradesheetHistory";
const EDIT_GRADESHEET_ID_KEY = "editGradeSheetId";

const getNewFormDefaults = (): GradeSheetFormValues => ({
    studentId: '',
    symbolNo: '',
    studentName: '',
    studentClass: '',
    rollNo: '',
    schoolName: 'ExamGenius Academy',
    logo: undefined,
    examType: 'Final Examination',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    examDate: '', // Set dynamically in effect
    subjects: [
        { subjectName: 'Sample Subject', fullMarks: 100, passMarks: 40, obtainedMarks: 0, id: crypto.randomUUID() }
    ],
});

export default function GradesheetPage() {
  const [calculatedResult, setCalculatedResult] = React.useState<CalculatedGradeSheetResult | null>(null);
  const [bulkResults, setBulkResults] = React.useState<CalculatedGradeSheetResult[] | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const [isDownloadingBulkPdf, setIsDownloadingBulkPdf] = React.useState(false);
  const { toast } = useToast();
  const [initialFormValues, setInitialFormValues] = React.useState<GradeSheetFormValues | undefined>(undefined);
  const [editingGradeSheetId, setEditingGradeSheetId] = React.useState<string | null>(null);
  const [entryMode, setEntryMode] = React.useState<'single' | 'bulk'>('single');
  
  const [template, setTemplate] = React.useState('normal');
  const [showGradeGpa, setShowGradeGpa] = React.useState(true);

  React.useEffect(() => {
    const gradeSheetIdToEdit = localStorage.getItem(EDIT_GRADESHEET_ID_KEY);
    if (gradeSheetIdToEdit) {
      setEntryMode('single');
      try {
        const storedHistory = localStorage.getItem(GRADESHEET_LOCAL_STORAGE_KEY);
        if (storedHistory) {
          const historyItems: StoredGradeSheet[] = JSON.parse(storedHistory);
          const gradeSheetToEdit = historyItems.find(item => item.id === gradeSheetIdToEdit);

          if (gradeSheetToEdit) {
            const formValues: GradeSheetFormValues = {
              ...gradeSheetToEdit.gradesheetData,
              logo: undefined,
            };
            setInitialFormValues(formValues);
            setCalculatedResult(gradeSheetToEdit.gradesheetData);
            setEditingGradeSheetId(gradeSheetToEdit.id);
            toast({
              title: "Editing Gradesheet",
              description: `Loaded gradesheet for "${gradeSheetToEdit.gradesheetData.studentName}" for editing.`,
            });
          } else {
             localStorage.removeItem(EDIT_GRADESHEET_ID_KEY);
             setInitialFormValues(getNewFormDefaults());
          }
        }
      } catch (error) {
        console.error("Failed to load gradesheet for editing:", error);
        toast({
          title: "Error Loading Gradesheet",
          description: "Could not load the selected gradesheet. Starting a new one.",
          variant: "destructive",
        });
        setInitialFormValues(getNewFormDefaults());
      } finally {
        if (gradeSheetIdToEdit) {
             localStorage.removeItem(EDIT_GRADESHEET_ID_KEY);
        }
      }
    } else {
      setInitialFormValues(getNewFormDefaults());
      setCalculatedResult(null);
      setEditingGradeSheetId(null);
    }
  }, [toast]);

  const handleFormSubmit = async (values: GradeSheetFormValues) => {
    setIsProcessing(true);
    setError(null);
    setBulkResults(null); 
    if (!editingGradeSheetId) {
      setCalculatedResult(null);
    }
    try {
      const { logo, ...otherFormValues } = values;
      let logoDataUri: string | undefined = undefined;

      if (logo) {
        try {
          logoDataUri = await fileToDataUri(logo);
        } catch (e) {
          console.error("Error converting logo to data URI:", e);
          toast({ title: "Logo Error", description: "Could not process the uploaded logo. Continuing without it.", variant: "destructive" });
        }
      } else if (editingGradeSheetId && calculatedResult?.logoDataUri) {
        logoDataUri = calculatedResult.logoDataUri;
      }
      
      const calculationOutput: GradeSheetCalculationOutput = calculateGradeSheet(values);
      const fullResult: CalculatedGradeSheetResult = { ...otherFormValues, logoDataUri, ...calculationOutput };
      setCalculatedResult(fullResult);

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(GRADESHEET_LOCAL_STORAGE_KEY);
          let existingHistory: StoredGradeSheet[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          
          if (editingGradeSheetId) {
            existingHistory = existingHistory.map(item =>
              item.id === editingGradeSheetId ? { ...item, gradesheetData: fullResult, dateGenerated: new Date().toISOString() } : item
            );
            toast({ title: "Gradesheet Updated!", description: "The gradesheet has been updated and saved to GS History." });
          } else {
            const newGradeSheetEntry: StoredGradeSheet = { id: crypto.randomUUID(), dateGenerated: new Date().toISOString(), gradesheetData: fullResult };
            existingHistory = [newGradeSheetEntry, ...existingHistory];
            toast({ title: "GradeSheet Generated!", description: "The gradesheet has been generated and saved to GS History." });
          }

          localStorage.setItem(GRADESHEET_LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 50)));
          if (editingGradeSheetId) setEditingGradeSheetId(null);
        } catch (storageError) {
          console.error("Error saving gradesheet to local storage:", storageError);
          toast({ title: "Warning", description: `Gradesheet ${editingGradeSheetId ? 'updated' : 'prepared'}, but failed to save to GS History.`, variant: "destructive" });
        }
      }
    } catch (e) {
      console.error("Error processing gradesheet:", e);
      setError("An unexpected error occurred while processing the gradesheet.");
      toast({ title: "Error Processing Gradesheet", description: e instanceof Error ? e.message : "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBulkFormSubmit = async (values: BulkGradeSheetFormValues) => {
    setIsProcessing(true);
    setError(null);
    setCalculatedResult(null); 
    setBulkResults(null);

    try {
        const { logo, students, subjects, ...sharedData } = values;
        let logoDataUri: string | undefined = undefined;
        if (logo) {
            try {
                logoDataUri = await fileToDataUri(logo);
            } catch (e) {
                console.error("Error converting logo to data URI:", e);
                toast({ title: "Logo Error", description: "Could not process the logo. Continuing without it.", variant: "destructive" });
            }
        }

        const newHistoryItems: StoredGradeSheet[] = [];
        const generatedResults: CalculatedGradeSheetResult[] = [];

        for (const student of students) {
            const singleStudentSubjects: SubjectMarkInput[] = subjects.map(s => ({
                id: s.id,
                subjectName: s.subjectName,
                fullMarks: s.fullMarks,
                passMarks: s.passMarks,
                obtainedMarks: student.obtainedMarks[s.id] || 0,
            }));

            const singleStudentFormValues: GradeSheetFormValues = {
                ...sharedData,
                studentId: student.studentId,
                symbolNo: student.symbolNo,
                studentName: student.studentName,
                rollNo: student.rollNo,
                subjects: singleStudentSubjects,
                logo: undefined,
            };

            const calculationOutput = calculateGradeSheet(singleStudentFormValues);
            const fullResult: CalculatedGradeSheetResult = { ...singleStudentFormValues, logoDataUri, ...calculationOutput };
            
            const newEntry: StoredGradeSheet = { id: crypto.randomUUID(), dateGenerated: new Date().toISOString(), gradesheetData: fullResult };
            newHistoryItems.push(newEntry);
            generatedResults.push(fullResult);
        }

        if (typeof window !== 'undefined') {
            const existingHistoryString = localStorage.getItem(GRADESHEET_LOCAL_STORAGE_KEY);
            let existingHistory: StoredGradeSheet[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
            const updatedHistory = [...newHistoryItems, ...existingHistory];
            localStorage.setItem(GRADESHEET_LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory.slice(0, 50)));
        }
        
        setBulkResults(generatedResults);

        toast({
            title: `Success: ${newHistoryItems.length} Gradesheets Generated!`,
            description: "All gradesheets saved to history. You can now download them as a single PDF.",
        });

    } catch (e) {
        console.error("Error processing bulk gradesheets:", e);
        setError("An unexpected error occurred during bulk processing.");
        toast({ title: "Error Processing Bulk Submission", description: e instanceof Error ? e.message : "An unknown error occurred.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
};


  const clearFormAndStartNew = () => {
    setInitialFormValues(getNewFormDefaults());
    setCalculatedResult(null);
    setEditingGradeSheetId(null);
    setBulkResults(null);
    toast({ title: "Form Cleared", description: "Ready for a new gradesheet."});
  };

  const handlePrint = () => {
    if (calculatedResult || bulkResults) {
      window.print();
    } else {
      toast({ title: "No Gradesheet Available", description: "Please generate a gradesheet before trying to print.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    if (!calculatedResult) {
        toast({ title: "No Gradesheet Available", description: "Please generate a gradesheet before trying to download PDF.", variant: "destructive" });
        return;
    }

    setIsDownloadingPdf(true);
    const paperElement = document.getElementById('gradesheet-printable-area');

    if (paperElement) {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfPageWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();

            const marginTopMM = 15;
            const marginBottomMM = 15;
            const marginLeftMM = 10;
            const marginRightMM = 10;

            const contentWidthMM = pdfPageWidth - marginLeftMM - marginRightMM;
            const contentHeightMM = pdfPageHeight - marginTopMM - marginBottomMM;

            const fullCanvas = await html2canvas(paperElement, { scale: 2, useCORS: true, logging: false });

            const fullCanvasWidthPx = fullCanvas.width;
            const fullCanvasHeightPx = fullCanvas.height;

            const pxPerMm = fullCanvasWidthPx / contentWidthMM;
            let pageSliceHeightPx = contentHeightMM * pxPerMm * 0.98; // Buffer

            let currentYpx = 0;
            while (currentYpx < fullCanvasHeightPx) {
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
                if (currentYpx < fullCanvasHeightPx) {
                    pdf.addPage();
                }
            }

            const safeStudentName = calculatedResult.studentName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';
            const filename = `gradesheet_${safeStudentName}_${calculatedResult.examType?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'exam'}.pdf`;
            pdf.save(filename);
            toast({ title: "PDF Downloaded", description: "Gradesheet PDF has been successfully downloaded." });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ title: "PDF Generation Failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
        }
    } else {
        toast({ title: "PDF Generation Error", description: "Could not find the gradesheet content to generate PDF.", variant: "destructive" });
    }
    setIsDownloadingPdf(false);
  };
  
  const handleBulkDownloadPdf = async () => {
    if (!bulkResults) {
        toast({ title: "No Gradesheets", description: "No bulk gradesheets are ready for download.", variant: "destructive" });
        return;
    }
    setIsDownloadingBulkPdf(true);
    
    const elements = document.querySelectorAll('#bulk-printable-area > .gradesheet-wrapper');
    if (elements.length === 0) {
        toast({ title: "Error", description: "Could not find gradesheet elements to download.", variant: "destructive" });
        setIsDownloadingBulkPdf(false);
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    try {
        let isFirstPageOfPdf = true;
        for (const el of Array.from(elements)) {
            const pageElement = el as HTMLElement;

            const pdfPageWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();
            const marginTopMM = 15, marginBottomMM = 15, marginLeftMM = 10, marginRightMM = 10;
            const contentWidthMM = pdfPageWidth - marginLeftMM - marginRightMM;
            const contentHeightMM = pdfPageHeight - marginTopMM - marginBottomMM;

            const fullCanvas = await html2canvas(pageElement, { scale: 2, useCORS: true, logging: false });
            const fullCanvasWidthPx = fullCanvas.width;
            const fullCanvasHeightPx = fullCanvas.height;
            const pxPerMm = fullCanvasWidthPx / contentWidthMM;
            const pageSliceHeightPx = contentHeightMM * pxPerMm * 0.98;

            let currentYpx = 0;
            while (currentYpx < fullCanvasHeightPx) {
                if (!isFirstPageOfPdf) {
                    pdf.addPage();
                } else {
                    isFirstPageOfPdf = false;
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
            }
        }
        
        pdf.save('all_gradesheets.pdf');
        toast({ title: 'Download Complete!', description: 'All gradesheets have been saved to a single PDF file.' });

    } catch (error) {
        console.error("Error during bulk PDF generation:", error);
        toast({ title: 'Error', description: 'Failed to generate bulk PDF.', variant: 'destructive' });
    } finally {
        setIsDownloadingBulkPdf(false);
    }
};

  const renderControls = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 no-print my-4 p-4 border rounded-lg bg-card shadow-sm">
       <div className="flex items-center space-x-2">
         <Switch
           id="show-grade-gpa-toggle"
           checked={showGradeGpa}
           onCheckedChange={setShowGradeGpa}
           aria-label="Toggle Grade and GPA visibility"
         />
         <Label htmlFor="show-grade-gpa-toggle">Show Grade & GPA</Label>
       </div>
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
  );


  if (!initialFormValues && entryMode === 'single') {
    return (
        <div className="flex-1 flex justify-center items-center p-6">
            <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Loading Gradesheet Tool...</p>
            </div>
        </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
        {editingGradeSheetId && (
            <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground no-print">
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <AlertTitle className="text-base sm:text-lg">Editing Mode</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                You are currently editing a saved gradesheet. Make your changes and click the button below to update it.
                <Button variant="outline" size="sm" onClick={clearFormAndStartNew} className="ml-2 sm:ml-4 mt-1 sm:mt-0 text-xs">
                    <RotateCcw className="mr-1 h-3 w-3" /> Create New Instead
                </Button>
                </AlertDescription>
            </Alert>
        )}
        <Card className="shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                  <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">Exam GradeSheet Tool</CardTitle>
              </div>
              <div className="flex items-center space-x-3 ml-auto">
                <User className="h-4 w-4" />
                <Label htmlFor="entry-mode-switch">Single</Label>
                <Switch
                  id="entry-mode-switch"
                  checked={entryMode === 'bulk'}
                  onCheckedChange={(checked) => {
                    setEntryMode(checked ? 'bulk' : 'single');
                    setBulkResults(null);
                    setCalculatedResult(null);
                  }}
                  disabled={!!editingGradeSheetId}
                  aria-label="Toggle between single student and bulk entry modes"
                />
                <Label htmlFor="entry-mode-switch">Bulk</Label>
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardDescription className="font-body text-sm sm:text-base">
              {entryMode === 'single'
                ? "Enter student, exam, and subject mark details to generate a comprehensive gradesheet."
                : "Efficiently create gradesheets for multiple students at once. Define subjects and then enter marks in the table."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
             <Alert variant="default" className="mb-4 sm:mb-6 border-accent bg-accent/10 text-accent-foreground">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <AlertTitle className="text-base sm:text-lg">Client-Side Operation</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  This GradeSheet tool operates in your browser. All data is saved to your local device and is not uploaded to any server.
                </AlertDescription>
            </Alert>
            
            {entryMode === 'single' ? (
                <GradeSheetForm
                    key={editingGradeSheetId || 'new-form'}
                    onSubmit={handleFormSubmit}
                    isLoading={isProcessing}
                    initialValues={initialFormValues!}
                />
            ) : (
                <BulkGradeSheetForm
                    onSubmit={handleBulkFormSubmit}
                    isLoading={isProcessing}
                />
            )}
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

        {calculatedResult && !isProcessing && entryMode === 'single' && (
          <>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-6 sm:mt-8 mb-4 sm:mb-6 no-print">
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                  <PrinterIcon className="mr-2 h-4 w-4" /> Print Gradesheet
                </Button>
                <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloadingPdf} className="w-full sm:w-auto">
                   {isDownloadingPdf ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading... </> ) : ( <> <Download className="mr-2 h-4 w-4" /> Download PDF </> )}
                </Button>
            </div>
            {renderControls()}
            <div className="animate-fadeInUp">
              <GradeSheetDisplay result={calculatedResult} template={template} showGradeGpa={showGradeGpa} />
            </div>
          </>
        )}
        
        {bulkResults && !isProcessing && (
           <>
            <div className="flex justify-center mt-6 no-print">
              <Button onClick={handleBulkDownloadPdf} disabled={isDownloadingBulkPdf} size="lg">
                {isDownloadingBulkPdf ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download All ({bulkResults.length}) Gradesheets as PDF
                  </>
                )}
              </Button>
            </div>

            {renderControls()}

            <div className="mt-8 space-y-8 no-print">
                <h2 className="text-2xl font-bold text-center">Gradesheet Previews</h2>
                {bulkResults.map((res, index) => (
                    <div key={`preview-${res.rollNo || index}`} className="p-4 border rounded-lg bg-white shadow-lg">
                        <GradeSheetDisplay 
                            result={res} 
                            template={template} 
                            showGradeGpa={showGradeGpa} 
                            printableId={`gradesheet-preview-${res.rollNo || index}`}
                        />
                    </div>
                ))}
            </div>
            
            <div className="absolute left-[-9999px] top-0 z-[-1] no-print">
                <div id="bulk-printable-area">
                    {bulkResults.map((res, index) => (
                        <div key={`print-${res.rollNo || index}`} className="gradesheet-wrapper">
                           <GradeSheetDisplay 
                            result={res} 
                            template={template} 
                            showGradeGpa={showGradeGpa} 
                            printableId={`gradesheet-print-${res.rollNo || index}`}
                           />
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}
      </div>
       <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
        .gradesheet-wrapper {
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            box-sizing: border-box;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
        }
      `}</style>
    </main>
  );
}
