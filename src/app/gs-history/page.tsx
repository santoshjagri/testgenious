
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ClipboardList, Trash2, Eye, ArrowLeft, Download, Printer as PrinterIcon, User, CalendarDays, BookOpen, Percent, Star, PlusCircle, Loader2, Hash, Edit, Palette, Search } from "lucide-react";
import type { StoredGradeSheet } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LOCAL_STORAGE_KEY = "gradesheetHistory";
const EDIT_GRADESHEET_ID_KEY = "editGradeSheetId";

export default function GradesheetHistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredGradeSheet[]>([]);
  const [selectedGradeSheetForView, setSelectedGradeSheetForView] = useState<StoredGradeSheet | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [template, setTemplate] = useState('normal');
  const [showGradeGpa, setShowGradeGpa] = useState(true);

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

  const filteredHistoryItems = historyItems.filter(item =>
    item.gradesheetData.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleEditGradeSheet = (gradesheetId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(EDIT_GRADESHEET_ID_KEY, gradesheetId);
      router.push('/gradesheet');
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
    const paperElement = document.getElementById('gradesheet-printable-area-history');

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

            const fullCanvas = await html2canvas(paperElement, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

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
      <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6 no-print">
            <Button 
              variant="outline" 
              onClick={() => setSelectedGradeSheetForView(null)} 
              className="w-full sm:w-auto sm:mr-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to GS History
            </Button>
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
        <GradeSheetDisplay 
          result={selectedGradeSheetForView.gradesheetData}
          template={template}
          showGradeGpa={showGradeGpa}
          printableId="gradesheet-printable-area-history"
        /> 
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-2 sm:p-4 md:gap-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl flex items-center">
          <ClipboardList className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          GS History
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by student name..."
                    className="pl-8 sm:w-[200px] md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => router.push('/gradesheet')} className="no-print w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New
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
              <AlertTitle className="text-primary text-base sm:text-lg">No Gradesheet History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80 text-xs sm:text-sm">
                You haven't generated any gradesheets yet. Click "Create New" above or go to "Gradesheet" in the sidebar to get started. Your generated gradesheets will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : filteredHistoryItems.length === 0 ? (
         <Card className="mt-4 shadow-md col-span-full">
            <CardContent className="pt-6">
                <Alert>
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary text-base sm:text-lg">No Results Found</AlertTitle>
                    <AlertDescription className="text-foreground/80 text-xs sm:text-sm">
                        No gradesheets match your search for "{searchQuery}". Try a different name.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {filteredHistoryItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                    <User className="h-5 w-5 flex-shrink-0"/>
                    <span className="truncate">{item.gradesheetData.studentName}</span>
                </CardTitle>
                <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    <p>Class: {item.gradesheetData.studentClass} - Roll: {item.gradesheetData.rollNo}</p>
                    <p>{item.gradesheetData.examType}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs flex-grow py-0 pb-3">
                <p><strong>Result:</strong> <span className={item.gradesheetData.resultStatus === "Pass" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{item.gradesheetData.resultStatus}</span></p>
                <p className="flex items-center"><Star className="h-3 w-3 mr-1.5"/><strong>Grade:</strong> {item.gradesheetData.grade}</p>
                 <p className="mt-2 text-xs text-muted-foreground pt-2 border-t flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1.5"/> 
                    {new Date(item.dateGenerated).toLocaleDateString()}
                 </p>
              </CardContent>
              <CardFooter className="border-t p-1 flex justify-around items-center">
                <Button variant="ghost" size="sm" onClick={() => handleViewGradeSheet(item)} className="text-primary hover:bg-primary/10 flex-1 text-xs h-8">
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEditGradeSheet(item.id)} className="text-foreground hover:bg-secondary flex-1 text-xs h-8">
                  <Edit className="mr-1 h-3 w-3" /> Recorrect
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-xs h-8">
                        <Trash2 className="mr-1 h-3 w-3" />
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

    
