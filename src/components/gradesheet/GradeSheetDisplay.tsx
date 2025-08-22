
"use client";

import * as React from 'react';
import type { CalculatedGradeSheetResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Award, User, CalendarCheck2, Percent, Star, TrendingUp, BookOpen, School, Hash } from 'lucide-react';
import Image from 'next/image';

interface GradeSheetDisplayProps {
  result: CalculatedGradeSheetResult;
  showGradeGpa: boolean;
  template: string;
  printableId?: string;
}

export function GradeSheetDisplay({ 
  result, 
  showGradeGpa, 
  template, 
  printableId = 'gradesheet-printable-area' 
}: GradeSheetDisplayProps) {
  
  const isValidLogoDataUri = result.logoDataUri && result.logoDataUri.startsWith('data:');
  
  const displayDate = result.examDate ? new Date(result.examDate).toLocaleDateString() : result.nepaliExamDate;
  const dateLabel = result.examDate ? 'Date (A.D.):' : 'Date (B.S.):';


  return (
    <Card className="shadow-2xl printable-area text-center" id={printableId} data-template={template}>
      <CardHeader className="bg-primary/5 p-3 sm:p-4 border-b-2 border-primary/20 gs-header">
        <div className="flex flex-col sm:flex-row items-center sm:items-start w-full gap-2 sm:gap-4 mb-2 sm:mb-3">
            <div className="flex-shrink-0 order-1 sm:order-none">
              {isValidLogoDataUri ? (
                <Image
                  src={result.logoDataUri!}
                  alt={result.schoolName ? `${result.schoolName} Logo` : "Uploaded School Logo"}
                  width={60}
                  height={60}
                  className="rounded-md object-contain w-16 h-16 sm:w-20 sm:h-20"
                  unoptimized
                />
              ) : (
                <Image
                  src="https://placehold.co/80x80.png"
                  alt="School Logo Placeholder"
                  width={60}
                  height={60}
                  className="rounded-md object-contain w-16 h-16 sm:w-20 sm:h-20"
                  data-ai-hint="school emblem"
                  unoptimized
                />
              )}
            </div>
            <div className="flex-grow flex flex-col items-center text-center order-2 sm:order-none">
              {result.schoolName ? 
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary gs-title">{result.schoolName}</CardTitle>
                : <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-1 sm:mb-2" /> 
              }
              <CardDescription className="text-sm sm:text-md text-muted-foreground">{result.examType} - Gradesheet</CardDescription>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 order-3 hidden sm:block"></div>
        </div>
        
        <Separator className="my-1 sm:my-2 bg-primary/15" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-foreground/80 text-left">
          <div className="flex items-center"><User className="w-3 h-3 mr-1.5"/><strong>Student:</strong> {result.studentName}</div>
          <div className="flex items-center"><School className="w-3 h-3 mr-1.5"/><strong>Class:</strong> {result.studentClass}</div>
          <div className="flex items-center"><Hash className="w-3 h-3 mr-1.5"/><strong>Roll No:</strong> {result.rollNo}</div>
          {result.studentId && <div className="flex items-center"><Hash className="w-3 h-3 mr-1.5"/><strong>Student ID:</strong> {result.studentId}</div>}
          {result.symbolNo && <div className="flex items-center"><Hash className="w-3 h-3 mr-1.5"/><strong>Symbol No:</strong> {result.symbolNo}</div>}
          <div className="flex items-center"><CalendarCheck2 className="w-3 h-3 mr-1.5"/><strong>Academic Year:</strong> {result.academicYear}</div>
          {displayDate && <div className="flex items-center"><CalendarCheck2 className="w-3 h-3 mr-1.5"/><strong>{dateLabel}</strong> {displayDate}</div>}
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 text-center">
        <div className="mb-3 inline-block w-full max-w-4xl text-left">
            <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 mr-2 text-primary/80" />
                <h3 className="text-base sm:text-lg font-semibold text-primary/90">Subject Performance</h3>
            </div>
          <div className="overflow-x-auto">
            <Table className="gs-table">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/60 text-xs sm:text-sm">
                  <TableHead className="w-[30%] sm:w-[40%] whitespace-nowrap py-2 px-3">Subject Name</TableHead>
                  <TableHead className="text-center whitespace-nowrap py-2 px-3">Theory Marks</TableHead>
                  <TableHead className="text-center whitespace-nowrap py-2 px-3">Practical Marks</TableHead>
                  <TableHead className="text-center whitespace-nowrap py-2 px-3">Total Obtained</TableHead>
                  <TableHead className="text-center whitespace-nowrap py-2 px-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs sm:text-sm">
                {result.subjects.map((subject, index) => (
                  <TableRow key={subject.id || `subject-${index}`} className="h-auto">
                    <TableCell className="font-medium py-1.5 px-3">{subject.subjectName}</TableCell>
                    <TableCell className="text-center py-1.5 px-3">{`${subject.theoryObtainedMarks} / ${subject.theoryFullMarks}`}</TableCell>
                    <TableCell className="text-center py-1.5 px-3">
                      {subject.practicalFullMarks ? `${subject.practicalObtainedMarks || 0} / ${subject.practicalFullMarks}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center font-semibold py-1.5 px-3">
                      {(subject.theoryObtainedMarks || 0) + (subject.practicalObtainedMarks || 0)}
                    </TableCell>
                    <TableCell className="text-center py-1.5 px-3">
                      {result.individualSubjectStatus.find(s => s.subjectName === subject.subjectName)?.status === "Pass" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 inline" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator className="my-3 bg-primary/15" />

        <div className="gs-summary inline-block w-full max-w-4xl text-left">
            <div className="flex items-center mb-2">
                <Star className="h-5 w-5 mr-2 text-primary/80" />
                <h3 className="text-base sm:text-lg font-semibold text-primary/90">Overall Summary</h3>
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 p-2 sm:p-3 border rounded-lg bg-secondary/30 shadow gs-summary-box">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total Obtained Marks</span>
              <span className="text-sm sm:text-base font-bold text-primary">{result.totalObtainedMarks} / {result.totalFullMarks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Percentage</span>
              <span className="text-sm sm:text-base font-bold text-primary">{result.percentage.toFixed(2)}%</span>
            </div>
            
            {showGradeGpa && (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Grade</span>
                  <span className="text-sm sm:text-base font-bold text-primary">{result.grade}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">GPA</span>
                  <span className="text-sm sm:text-base font-bold text-primary">{result.gpa.toFixed(1)}</span>
                </div>
              </>
            )}

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Result Status</span>
              <span className={`text-sm sm:text-base font-bold ${result.resultStatus === "Pass" ? "text-green-600" : "text-red-600"}`}>
                {result.resultStatus}
              </span>
            </div>
            {result.remarks && (
                 <div className="flex flex-col col-span-2 md:col-span-3">
                    <span className="text-xs text-muted-foreground">Remarks</span>
                    <span className="text-xs sm:text-sm font-medium text-foreground/90">{result.remarks}</span>
                </div>
            )}
          </div>
        </div>
      </CardContent>
      {template !== 'best' && (
        <CardFooter className="p-4 sm:p-6 border-t border-primary/10 gs-footer">
          <div className="flex justify-between w-full text-xs sm:text-sm text-muted-foreground">
              <div className="text-center w-1/3 px-2 signature-container">
                  <div className="signature-line"></div>
                  <div className="signature-title">Class Teacher</div>
              </div>
              <div className="text-center w-1/3 px-2 signature-container">
                  <div className="signature-line"></div>
                  <div className="signature-title">Principal</div>
              </div>
              <div className="text-center w-1/3 px-2 signature-container">
                  <div className="signature-line"></div>
                  <div className="signature-title">Date</div>
              </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
