
"use client";

import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bulkGradeSheetFormSchema, type BulkGradeSheetFormValues, GradeSheetExamTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, School, Award, PlusCircle, Trash2, ImagePlus, CalendarDays, BookOpen, Users, Hash } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

interface BulkGradeSheetFormProps {
  onSubmit: (values: BulkGradeSheetFormValues) => Promise<void>;
  isLoading: boolean;
}

export function BulkGradeSheetForm({ onSubmit, isLoading }: BulkGradeSheetFormProps) {
  const form = useForm<BulkGradeSheetFormValues>({
    resolver: zodResolver(bulkGradeSheetFormSchema),
    defaultValues: {
      schoolName: 'ExamGenius Academy',
      studentClass: '',
      examType: 'Final Examination',
      academicYear: '', // Set statically
      examDate: '', 
      nepaliExamDate: '',
      subjects: [{ id: crypto.randomUUID(), subjectName: '', theoryFullMarks: 100, theoryPassMarks: 40, practicalFullMarks: undefined, practicalPassMarks: undefined }],
      students: [{ id: crypto.randomUUID(), studentName: '', rollNo: '', obtainedMarks: {} }],
    },
  });

  // Set date-dependent default values on the client-side to avoid hydration errors
  React.useEffect(() => {
    form.reset({
      ...form.getValues(),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      examDate: '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dateType, setDateType] = React.useState('AD');


  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const { fields: studentFields, append: appendStudent, remove: removeStudent } = useFieldArray({
    control: form.control,
    name: "students",
  });
  
  const subjects = useWatch({ control: form.control, name: 'subjects' });

  const handleAddSubject = () => {
    appendSubject({ id: crypto.randomUUID(), subjectName: '', theoryFullMarks: 100, theoryPassMarks: 40 });
  };
  
  const handleAddStudent = () => {
    const newStudentMarks: Record<string, { theory: number; practical?: number }> = {};
    subjects.forEach(subject => {
        newStudentMarks[subject.id] = { theory: 0 };
        if (subject.practicalFullMarks) {
            newStudentMarks[subject.id].practical = 0;
        }
    });
    appendStudent({ id: crypto.randomUUID(), studentName: '', rollNo: '', obtainedMarks: newStudentMarks });
  };
  
  const handleRemoveSubject = (index: number) => {
    const subjectIdToRemove = subjects[index]?.id;
    if (subjectIdToRemove) {
      form.getValues().students.forEach((student, studentIndex) => {
        const newMarks = { ...student.obtainedMarks };
        delete newMarks[subjectIdToRemove];
        form.setValue(`students.${studentIndex}.obtainedMarks`, newMarks);
      });
    }
    removeSubject(index);
  }

  const handleDateTypeChange = (type: string) => {
    setDateType(type);
    if (type === 'AD') {
      form.setValue('nepaliExamDate', '');
    } else {
      form.setValue('examDate', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        
        {/* --- Shared Info --- */}
        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><School className="mr-2 h-5 w-5" />Shared Information</CardTitle>
            <CardDescription>This information applies to all students in this batch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
               <FormField name="schoolName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="e.g., Springfield High" {...field} /></FormControl><FormMessage /></FormItem> )} />
               <FormField name="logo" control={form.control} render={({ field: { onChange, ...rest } }) => ( <FormItem><FormLabel>School Logo (Optional)</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem> )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField name="studentClass" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="e.g., Class 10" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="academicYear" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input placeholder="e.g., 2023-2024" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField name="examType" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Exam Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent>{GradeSheetExamTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-2">
                    <FormItem>
                        <FormLabel>Date Type</FormLabel>
                        <Select value={dateType} onValueChange={handleDateTypeChange}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="AD">A.D.</SelectItem><SelectItem value="BS">B.S.</SelectItem></SelectContent>
                        </Select>
                    </FormItem>
                    {dateType === 'AD' ? (
                        <FormField name="examDate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Choose Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem> )} />
                    ) : (
                        <FormField name="nepaliExamDate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Enter Date</FormLabel><FormControl><Input placeholder="e.g., 2081-04-01" {...field} /></FormControl><FormMessage/></FormItem> )} />
                    )}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Subject Definition --- */}
        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><BookOpen className="mr-2 h-5 w-5" />Define Subjects</CardTitle>
            <CardDescription>Add all subjects. Practical marks fields are optional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-4">
            {subjectFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <FormField name={`subjects.${index}.subjectName`} control={form.control} render={({ field }) => ( <FormItem className="sm:col-span-3"><FormLabel className="text-xs">Subject Name</FormLabel><FormControl><Input placeholder="e.g., Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name={`subjects.${index}.theoryFullMarks`} control={form.control} render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Theory Full</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                <FormField name={`subjects.${index}.theoryPassMarks`} control={form.control} render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Theory Pass</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                <FormField name={`subjects.${index}.practicalFullMarks`} control={form.control} render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Prac. Full (Opt)</FormLabel><FormControl><Input type="number" {...field} placeholder="Opt." onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem> )} />
                <FormField name={`subjects.${index}.practicalPassMarks`} control={form.control} render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Prac. Pass (Opt)</FormLabel><FormControl><Input type="number" {...field} placeholder="Opt." onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem> )} />
                <div className="sm:col-span-1">
                  {subjectFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubject(index)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </div>
            ))}
             <Button type="button" variant="outline" onClick={handleAddSubject} className="mt-2 border-dashed"><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
          </CardContent>
        </Card>
        
        {/* --- Student Marks Entry --- */}
        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><Users className="mr-2 h-5 w-5" />Student Marks Entry</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Student Name</TableHead>
                    <TableHead className="min-w-[100px]">Roll (Opt)</TableHead>
                    <TableHead className="min-w-[120px]">Symbol (Opt)</TableHead>
                    {subjects.map((subject, index) => (
                      <TableHead key={subject.id} className="min-w-[150px]">
                        {subject.subjectName || `Subject ${index + 1}`}
                        <div className="text-xs font-normal text-muted-foreground flex gap-x-3 mt-1">
                            <Label>Theory</Label>
                            {!!subject.practicalFullMarks && <Label>Practical</Label>}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFields.map((studentField, studentIndex) => (
                    <TableRow key={studentField.id}>
                      <TableCell><FormField control={form.control} name={`students.${studentIndex}.studentName`} render={({ field }) => <Input placeholder="Name" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`students.${studentIndex}.rollNo`} render={({ field }) => <Input placeholder="Roll" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`students.${studentIndex}.symbolNo`} render={({ field }) => <Input placeholder="Symbol" {...field} />} /></TableCell>
                      {subjects.map((subject) => (
                         <TableCell key={subject.id}>
                           <div className="flex items-start gap-1">
                             <FormField
                                control={form.control}
                                name={`students.${studentIndex}.obtainedMarks.${subject.id}.theory`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input type="number" placeholder="Th." {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="w-16 text-xs" /></FormControl>
                                        <FormMessage className="text-xs"/>
                                    </FormItem>
                                )}
                             />
                             {!!subject.practicalFullMarks && (
                                <FormField
                                    control={form.control}
                                    name={`students.${studentIndex}.obtainedMarks.${subject.id}.practical`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input type="number" placeholder="Pr." {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} className="w-16 text-xs" /></FormControl>
                                            <FormMessage className="text-xs"/>
                                        </FormItem>
                                    )}
                                />
                             )}
                           </div>
                         </TableCell>
                      ))}
                      <TableCell>
                          {studentFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeStudent(studentIndex)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <div className="p-3 sm:p-4">
              <Button type="button" variant="outline" onClick={handleAddStudent} className="mt-2 border-dashed"><PlusCircle className="mr-2 h-4 w-4" /> Add Student</Button>
            </div>
             {form.formState.errors.students?.root?.message && (
                 <div className="p-3 sm:p-4 border-t">
                    <FormMessage>{form.formState.errors.students.root.message}</FormMessage>
                 </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Batch...</>
          ) : 'Generate All Gradesheets'}
        </Button>
      </form>
    </Form>
  );
}
