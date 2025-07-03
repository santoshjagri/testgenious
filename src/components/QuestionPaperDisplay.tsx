
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import type { GenerateQuestionsOutput } from '@/ai/flows/generate-questions';
import type { QuestionPaperDisplayFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListOrdered, FileText, FileSignature, Download, PencilLine, ClipboardCheck, CalculatorIcon, Info, FileQuestion, Loader2, Printer as PrinterIcon } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuestionPaperDisplayProps {
  formData: QuestionPaperDisplayFormData;
  questions: GenerateQuestionsOutput;
  template?: string;
  printableId?: string;
  showControls?: boolean;
}

export function QuestionPaperDisplay({ formData, questions, template = 'normal', printableId, showControls = true }: QuestionPaperDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    if (formData.manualDate) {
      setDisplayDate(formData.manualDate);
    } else {
      // Client-side effect to avoid hydration mismatch for date
      setDisplayDate(new Date().toLocaleDateString());
    }
  }, [formData.manualDate]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const paperElement = document.getElementById(printableId ?? 'question-paper');
    
    if (paperElement) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const marginTopMM = 20; 
        const marginBottomMM = 20;
        const marginLeftMM = 15; 
        const marginRightMM = 15;

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
            
            if (currentYpx > 0) {
              pdf.addPage();
            }

            pdf.addImage(pageImgData, 'PNG', marginLeftMM, marginTopMM, contentWidthMM, actualContentHeightMMForThisPage);
          }

          currentYpx += pageSliceHeightPx;
        }
        
        const safeSubject = formData.subject?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'paper';
        const safeClassLevel = formData.classLevel?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'level';
        const filename = `question_paper_${safeSubject}_${safeClassLevel}.pdf`;
        
        pdf.save(filename);

      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
    setIsDownloading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  let sectionCounter = 0;
  const getSectionLetter = () => String.fromCharCode(65 + sectionCounter++);
  

  const renderQuestionList = (questionArray: string[] | undefined, listType: 'ol' | 'ul' = 'ol') => {
    if (!questionArray || questionArray.length === 0) return null;
    const ListComponent = listType;
    return (
      <ListComponent className={`space-y-1.5 list-none pl-0 text-sm sm:text-base`}>
        {questionArray.map((questionText, index) => (
          <li key={`q-${index}`} className="flex">
            <span className="mr-2">{listType === 'ol' ? `${index + 1}.` : '•'}</span>
            <span>{questionText}</span>
          </li>
        ))}
      </ListComponent>
    );
  };

  const isValidLogoDataUri = formData.logoDataUri && formData.logoDataUri.startsWith('data:');


  return (
    <div className="mt-8 sm:mt-12">
      {showControls && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6 no-print">
          <Button onClick={handleDownloadPdf} variant="default" className="w-full sm:w-auto shadow-md" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Download Paper (PDF)
              </>
            )}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto shadow-md">
            <PrinterIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Print Paper
          </Button>
        </div>
      )}

      <Card className="printable-area shadow-2xl rounded-lg" id={printableId ?? 'question-paper'} data-template={template}>
        <CardHeader className="p-4 sm:p-6 qp-header">
            <div className="flex flex-col sm:flex-row items-center sm:items-start w-full gap-4">
                <div className="flex-shrink-0">
                  {isValidLogoDataUri ? (
                    <Image
                      src={formData.logoDataUri!}
                      alt={formData.institutionName ? `${formData.institutionName} Logo` : "Uploaded Institute Logo"}
                      width={60}
                      height={60}
                      className="rounded-md object-contain sm:w-20 sm:h-20"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src="https://placehold.co/80x80.png"
                      alt="Institute Logo Placeholder"
                      width={60}
                      height={60}
                      className="rounded-md object-contain sm:w-20 sm:h-20"
                      data-ai-hint="school emblem"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-grow flex flex-col items-center text-center">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 qp-title">{formData.institutionName || "ExamGenius AI Institute"}</h1>
                  {formData.institutionAddress && <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{formData.institutionAddress}</p>}
                  <h2 className="text-md sm:text-lg font-semibold mb-0.5 sm:mb-1">{formData.examType}</h2>
                  {displayDate && <p className="text-xs sm:text-sm text-muted-foreground">Date: {displayDate}</p>}
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <div><strong>Subject:</strong> {formData.subject}</div>
                <div>{formData.subjectCode ? <><strong>Subject Code:</strong> {formData.subjectCode}</> : <span>&nbsp;</span>}</div>
                <div><strong>Class/Level:</strong> {formData.classLevel}</div>
                <div><strong>Full Marks:</strong> {formData.totalMarks}</div>
                <div><strong>Time Allowed:</strong> {formData.timeLimit}</div>
                <div><strong>Pass Marks:</strong> {formData.passMarks}</div>
            </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {formData.instructions && (
            <div className="mb-3 sm:mb-4 p-2 border rounded-md qp-instructions">
              <div className="flex items-center mb-1 sm:mb-1.5">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <h3 className="text-xs sm:text-sm font-semibold">Instructions for Students:</h3>
              </div>
              <p className="whitespace-pre-line text-xs">{formData.instructions}</p>
            </div>
          )}

          {questions.mcqs && questions.mcqs.length > 0 && (
            <section aria-labelledby="mcq-section-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <ListOrdered className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="mcq-section-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Multiple Choice Questions</h2>
              </div>
              <div className="space-y-2 text-sm sm:text-base">
                {questions.mcqs.map((questionText, index) => (
                  <p key={`mcq-${index}`}>{questionText}</p>
                ))}
              </div>
            </section>
          )}

          {questions.veryShortQuestions && questions.veryShortQuestions.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="very-short-questions-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <FileQuestion className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="very-short-questions-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Very Short Answer Questions</h2>
              </div>
              {renderQuestionList(questions.veryShortQuestions)}
            </section>
            </>
          )}

          {questions.fillInTheBlanks && questions.fillInTheBlanks.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="fitb-section-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <PencilLine className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="fitb-section-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Fill in the Blanks</h2>
              </div>
              {renderQuestionList(questions.fillInTheBlanks)}
            </section>
            </>
          )}

          {questions.trueFalseQuestions && questions.trueFalseQuestions.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="tf-section-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="tf-section-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: True or False</h2>
              </div>
              {renderQuestionList(questions.trueFalseQuestions)}
            </section>
            </>
          )}
          
          {questions.shortQuestions && questions.shortQuestions.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="short-questions-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="short-questions-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Short Answer Questions</h2>
              </div>
              {renderQuestionList(questions.shortQuestions)}
            </section>
            </>
          )}

          {questions.longQuestions && questions.longQuestions.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="long-questions-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <FileSignature className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="long-questions-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Long Answer Questions</h2>
              </div>
              {renderQuestionList(questions.longQuestions)}
            </section>
            </>
          )}

          {questions.numericalPracticalQuestions && questions.numericalPracticalQuestions.length > 0 && (
            <>
            <Separator className="my-4 sm:my-6" />
            <section aria-labelledby="num-prac-questions-title">
              <div className="flex items-center mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-t-md border-b-2 qp-section-header">
                <CalculatorIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                <h2 id="num-prac-questions-title" className="text-sm sm:text-base md:text-lg font-semibold">Section {getSectionLetter()}: Numerical / Practical Questions</h2>
              </div>
               {renderQuestionList(questions.numericalPracticalQuestions)}
            </section>
            </>
          )}
        </CardContent>
        <div className="p-3 sm:p-4 border-t text-center qp-footer">
            <div className="w-full">
                <p className="my-1 sm:my-2 text-xs sm:text-sm font-medium">Best Of Luck!</p>
            </div>
        </div>
      </Card>
    </div>
  );
}
