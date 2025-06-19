
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
}

export function QuestionPaperDisplay({ formData, questions }: QuestionPaperDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    if (formData.manualDate) {
      setDisplayDate(formData.manualDate);
    } else {
      // This will only run on the client, after initial hydration
      setDisplayDate(new Date().toLocaleDateString());
    }
  }, [formData.manualDate]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const paperElement = document.getElementById('question-paper');
    
    if (paperElement) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const marginValue = 10; // 10mm margin on all sides

        const contentWidthMM = pdfPageWidth - 2 * marginValue;
        const contentHeightMM = pdfPageHeight - 2 * marginValue;

        const fullCanvas = await html2canvas(paperElement, {
          scale: 2, 
          useCORS: true,
          logging: false,
           onclone: (document) => {
            // You can add custom DOM manipulations here if needed before canvas capture
          }
        });

        const fullCanvasWidthPx = fullCanvas.width;
        const fullCanvasHeightPx = fullCanvas.height;

        const pxPerMm = fullCanvasWidthPx / contentWidthMM; 
        const pageSliceHeightPx = contentHeightMM * pxPerMm;

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
              0, 
              currentYpx, 
              fullCanvasWidthPx, 
              sliceForThisPagePx, 
              0, 
              0, 
              fullCanvasWidthPx, 
              sliceForThisPagePx 
            );

            const pageImgData = pageCanvas.toDataURL('image/png', 0.9); 
            
            const actualContentHeightMMForThisPage = (sliceForThisPagePx / pxPerMm);

            pdf.addImage(pageImgData, 'PNG', marginValue, marginValue, contentWidthMM, actualContentHeightMMForThisPage);
          }

          currentYpx += sliceForThisPagePx;

          if (currentYpx < fullCanvasHeightPx) {
            pdf.addPage();
          }
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
  

  const renderQuestionList = (questionArray: string[] | undefined) => {
    if (!questionArray || questionArray.length === 0) return null;
    return (
      <ol className="space-y-4 list-none pl-0 text-sm">
        {questionArray.map((questionText, index) => (
          <li key={`q-${index}`} className="pb-1 flex">
            <span>{questionText}</span>
          </li>
        ))}
      </ol>
    );
  };


  return (
    <div className="mt-12">
      <div className="flex flex-wrap gap-2 mb-6 no-print">
        <Button onClick={handleDownloadPdf} variant="default" className="w-full md:w-auto shadow-md" disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download Paper (PDF)
            </>
          )}
        </Button>
        <Button onClick={handlePrint} variant="outline" className="w-full md:w-auto shadow-md">
           <PrinterIcon className="mr-2 h-5 w-5" />
          Print Paper
        </Button>
      </div>

      <Card className="printable-area shadow-2xl rounded-lg border-2 border-primary/20 bg-white text-black" id="question-paper">
        <CardHeader className="p-6 border-b-2 border-black">
            <div className="flex flex-row items-start w-full">
                <div className="flex-shrink-0 mr-6">
                  <Image
                    src={formData.logoDataUri || "https://placehold.co/80x80.png"}
                    alt={formData.institutionName ? `${formData.institutionName} Logo` : "Institute Logo"}
                    width={80}
                    height={80}
                    className="rounded-md object-contain"
                    data-ai-hint="school emblem"
                    unoptimized 
                  />
                </div>
                <div className="flex-grow flex flex-col items-center text-center">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{formData.institutionName || "ExamGenius AI Institute"}</h1>
                  {formData.institutionAddress && <p className="text-xs sm:text-sm text-gray-700 mb-2">{formData.institutionAddress}</p>}
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">{formData.examType}</h2>
                  {displayDate && <p className="text-xs sm:text-sm text-gray-700">Date: {displayDate}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 text-sm mt-4 pt-4 border-t border-gray-300">
                <div><strong>Subject:</strong> {formData.subject}</div>
                {formData.subjectCode && <div><strong>Subject Code:</strong> {formData.subjectCode}</div>}
                <div><strong>Full Marks:</strong> {formData.totalMarks}</div>
                <div><strong>Class/Level:</strong> {formData.classLevel}</div>
                <div><strong>Pass Marks:</strong> {formData.passMarks}</div>
                <div><strong>Time Allowed:</strong> {formData.timeLimit}</div>
            </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-6">
          {formData.instructions && (
            <div className="mb-6 p-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center mb-2">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-md font-semibold text-gray-700">Instructions for Students:</h3>
              </div>
              <p className="whitespace-pre-line text-sm text-gray-700">{formData.instructions}</p>
            </div>
          )}

          {questions.mcqs && questions.mcqs.length > 0 && (
            <section aria-labelledby="mcq-section-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <ListOrdered className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="mcq-section-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Multiple Choice Questions</h2>
              </div>
              <div className="space-y-4 text-sm">
                {questions.mcqs.map((questionText, index) => (
                  <div key={`mcq-${index}`} className="pb-2">
                    <p className="mb-2 text-sm">{questionText}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {questions.veryShortQuestions && questions.veryShortQuestions.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="very-short-questions-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <FileQuestion className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="very-short-questions-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Very Short Answer Questions</h2>
              </div>
              {renderQuestionList(questions.veryShortQuestions)}
            </section>
            </>
          )}

          {questions.fillInTheBlanks && questions.fillInTheBlanks.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="fitb-section-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <PencilLine className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="fitb-section-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Fill in the Blanks</h2>
              </div>
              {renderQuestionList(questions.fillInTheBlanks)}
            </section>
            </>
          )}

          {questions.trueFalseQuestions && questions.trueFalseQuestions.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="tf-section-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <ClipboardCheck className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="tf-section-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: True or False</h2>
              </div>
              {renderQuestionList(questions.trueFalseQuestions)}
            </section>
            </>
          )}
          
          {questions.shortQuestions && questions.shortQuestions.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="short-questions-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <FileText className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="short-questions-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Short Answer Questions</h2>
              </div>
              {renderQuestionList(questions.shortQuestions)}
            </section>
            </>
          )}

          {questions.longQuestions && questions.longQuestions.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="long-questions-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <FileSignature className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="long-questions-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Long Answer Questions</h2>
              </div>
              {renderQuestionList(questions.longQuestions)}
            </section>
            </>
          )}

          {questions.numericalPracticalQuestions && questions.numericalPracticalQuestions.length > 0 && (
            <>
            <Separator className="my-6 border-gray-300" />
            <section aria-labelledby="num-prac-questions-title">
              <div className="flex items-center mb-3 p-2 bg-gray-100 rounded-t-md border-b-2 border-gray-400">
                <CalculatorIcon className="h-6 w-6 mr-3 text-gray-700" />
                <h2 id="num-prac-questions-title" className="text-base sm:text-lg font-semibold text-gray-800">Section {getSectionLetter()}: Numerical / Practical Questions</h2>
              </div>
               {renderQuestionList(questions.numericalPracticalQuestions)}
            </section>
            </>
          )}
        </CardContent>
        <div className="p-4 border-t border-gray-300 text-center text-gray-500">
            <div className="w-full">
                <p className="my-2 text-sm font-medium">Best Of Luck!</p>
                <p className="mt-1 text-xs">Generated by ExamGenius AI &copy; {new Date().getFullYear()}</p>
            </div>
        </div>
      </Card>
    </div>
  );
}


    