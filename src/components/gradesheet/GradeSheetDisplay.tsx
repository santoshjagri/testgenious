
"use client";

import { useState, useEffect } from 'react';
import type { CalculatedGradeSheetResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Award, User, CalendarCheck2, Percent, Star, TrendingUp, BookOpen, Edit, Download, Printer as PrinterIcon, School, Loader2, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GradeSheetDisplayProps {
  result: CalculatedGradeSheetResult;
}

export function GradeSheetDisplay({ result }: GradeSheetDisplayProps) {
  
  return (
    <Card className="shadow-2xl printable-area" id="gradesheet-printable-area">
      <CardHeader className="bg-primary/5 p-4 sm:p-6 border-b-2 border-primary/20">
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
          <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-1 sm:mb-2" />
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{result.schoolName}</CardTitle>
          <CardDescription className="text-sm sm:text-md text-muted-foreground">{result.examType} - Gradesheet</CardDescription>
        </div>
        
        <Separator className="my-2 sm:my-3 bg-primary/15" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-foreground/80">
          <div><strong>Student:</strong> {result.studentName}</div>
          <div><strong>Class:</strong> {result.studentClass}</div>
          <div><strong>Roll No:</strong> {result.rollNo}</div>
          {result.studentId && <div><strong>Student ID:</strong> {result.studentId}</div>}
          {result.symbolNo && <div><strong>Symbol No:</strong> {result.symbolNo}</div>}
          <div><strong>Academic Year:</strong> {result.academicYear}</div>
          <div><strong>Exam Date:</strong> {new Date(result.examDate).toLocaleDateString()}</div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2 sm:mb-3">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary/80" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary/90">Subject Performance</h3>
            </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/60 text-xs sm:text-sm">
                  <TableHead className="w-[30%] sm:w-[40%] whitespace-nowrap">Subject Name</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Full Marks</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Pass Marks</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Obtained Marks</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs sm:text-sm">
                {result.subjects.map((subject, index) => (
                  <TableRow key={subject.id || `subject-${index}`}>
                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                    <TableCell className="text-center">{subject.fullMarks}</TableCell>
                    <TableCell className="text-center">{subject.passMarks}</TableCell>
                    <TableCell className="text-center font-semibold">{subject.obtainedMarks}</TableCell>
                    <TableCell className="text-center">
                      {result.individualSubjectStatus.find(s => s.subjectName === subject.subjectName)?.status === "Pass" ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 inline" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator className="my-4 sm:my-6 bg-primary/15" />

        <div>
            <div className="flex items-center mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary/80" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary/90">Overall Summary</h3>
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 p-3 sm:p-4 border rounded-lg bg-secondary/30 shadow">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Obtained Marks</span>
              <span className="text-md sm:text-lg font-bold text-primary">{result.totalObtainedMarks} / {result.totalFullMarks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Percentage</span>
              <span className="text-md sm:text-lg font-bold text-primary">{result.percentage.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Grade</span>
              <span className="text-md sm:text-lg font-bold text-primary">{result.grade}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">GPA</span>
              <span className="text-md sm:text-lg font-bold text-primary">{result.gpa.toFixed(1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Result Status</span>
              <span className={`text-md sm:text-lg font-bold ${result.resultStatus === "Pass" ? "text-green-600" : "text-red-600"}`}>
                {result.resultStatus}
              </span>
            </div>
            {result.remarks && (
                 <div className="flex flex-col col-span-2 md:col-span-3">
                    <span className="text-xs sm:text-sm text-muted-foreground">Remarks</span>
                    <span className="text-sm sm:text-md font-medium text-foreground/90">{result.remarks}</span>
                </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t border-primary/10 flex-col items-center text-center space-y-1 sm:space-y-2">
        {/* Removed "Generated by ExamGenius AI" line from here */}
      </CardFooter>
    </Card>
  );
}
