
"use client";

import type { CalculatedGradeSheetResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Award, User, CalendarCheck2, Percent, Star, TrendingUp, BookOpen, Edit, Download, Printer, School } from 'lucide-react';
import { Button } from '../ui/button';

interface GradeSheetDisplayProps {
  result: CalculatedGradeSheetResult;
}

export function GradeSheetDisplay({ result }: GradeSheetDisplayProps) {
  
  const handlePrint = () => {
    window.print();
  };

  // Placeholder for PDF Download logic (can be complex, similar to QuestionPaperDisplay)
  const handleDownloadPdf = () => {
    alert("PDF Download functionality will be implemented in a future update.");
    // Similar logic to QuestionPaperDisplay's PDF generation would go here
    // using html2canvas and jsPDF, targeting the 'gradesheet-printable-area'.
  };
  
  return (
    <Card className="shadow-2xl printable-area" id="gradesheet-printable-area">
      <CardHeader className="bg-primary/5 p-6 border-b-2 border-primary/20">
        <div className="flex flex-col items-center text-center mb-4">
          <Award className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{result.schoolName}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">{result.examType} - Gradesheet</CardDescription>
        </div>
        
        <Separator className="my-3 bg-primary/15" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-foreground/80">
          <div><strong>Student:</strong> {result.studentName}</div>
          <div><strong>Class:</strong> {result.studentClass}</div>
          <div><strong>Roll No:</strong> {result.rollNo}</div>
          {result.studentId && <div><strong>Student ID:</strong> {result.studentId}</div>}
          <div><strong>Academic Year:</strong> {result.academicYear}</div>
          <div><strong>Exam Date:</strong> {new Date(result.examDate).toLocaleDateString()}</div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6">
            <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 mr-3 text-primary/80" />
                <h3 className="text-xl font-semibold text-primary/90">Subject Performance</h3>
            </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/60">
                <TableHead className="w-[40%]">Subject Name</TableHead>
                <TableHead className="text-center">Full Marks</TableHead>
                <TableHead className="text-center">Pass Marks</TableHead>
                <TableHead className="text-center">Obtained Marks</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.subjects.map((subject, index) => (
                <TableRow key={subject.id || `subject-${index}`}>
                  <TableCell className="font-medium">{subject.subjectName}</TableCell>
                  <TableCell className="text-center">{subject.fullMarks}</TableCell>
                  <TableCell className="text-center">{subject.passMarks}</TableCell>
                  <TableCell className="text-center font-semibold">{subject.obtainedMarks}</TableCell>
                  <TableCell className="text-center">
                    {result.individualSubjectStatus.find(s => s.subjectName === subject.subjectName)?.status === "Pass" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 inline" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 inline" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator className="my-6 bg-primary/15" />

        <div>
            <div className="flex items-center mb-4">
                <Star className="h-6 w-6 mr-3 text-primary/80" />
                <h3 className="text-xl font-semibold text-primary/90">Overall Summary</h3>
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 p-4 border rounded-lg bg-secondary/30 shadow">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Obtained Marks</span>
              <span className="text-lg font-bold text-primary">{result.totalObtainedMarks} / {result.totalFullMarks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Percentage</span>
              <span className="text-lg font-bold text-primary">{result.percentage.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Grade</span>
              <span className="text-lg font-bold text-primary">{result.grade}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">GPA</span>
              <span className="text-lg font-bold text-primary">{result.gpa.toFixed(1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Result Status</span>
              <span className={`text-lg font-bold ${result.resultStatus === "Pass" ? "text-green-600" : "text-red-600"}`}>
                {result.resultStatus}
              </span>
            </div>
            {result.remarks && (
                 <div className="flex flex-col md:col-span-3">
                    <span className="text-sm text-muted-foreground">Remarks</span>
                    <span className="text-md font-medium text-foreground/90">{result.remarks}</span>
                </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 border-t border-primary/10 flex-col items-center text-center space-y-2 text-xs text-muted-foreground">
         <div className="flex flex-wrap gap-3 mb-4 no-print">
            <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> Print Gradesheet
            </Button>
            <Button onClick={handleDownloadPdf} variant="default" size="sm" disabled> {/* Disabled for now */}
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
        <p>Generated by ExamGenius AI &copy; {new Date().getFullYear()}</p>
        <p className="italic">This is a computer-generated gradesheet. For official use, please verify with school records.</p>
      </CardFooter>
    </Card>
  );
}
