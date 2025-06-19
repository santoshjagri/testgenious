
"use client";

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gradeSheetFormSchema, type GradeSheetFormValues, GradeSheetExamTypes, type SubjectMarkInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, BookOpen, CalendarDays, Hash, School, Award, PlusCircle, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface GradeSheetFormProps {
  onSubmit: (values: GradeSheetFormValues) => Promise<void>;
  isLoading: boolean;
  initialValues?: GradeSheetFormValues;
}

// Template for a new subject, ID will be added dynamically
const newSubjectTemplate: Omit<SubjectMarkInput, 'id'> = {
  subjectName: '',
  fullMarks: 100,
  passMarks: 40,
  obtainedMarks: 0,
};

export function GradeSheetForm({ onSubmit, isLoading, initialValues }: GradeSheetFormProps) {
  const form = useForm<GradeSheetFormValues>({
    resolver: zodResolver(gradeSheetFormSchema),
    defaultValues: initialValues || {
      studentId: '',
      symbolNo: '',
      studentName: '',
      studentClass: '',
      rollNo: '',
      schoolName: 'ExamGenius Academy',
      examType: 'Final Examination',
      academicYear: "", // Placeholder, will be set in useEffect for new forms
      examDate: "",     // Placeholder, will be set in useEffect for new forms
      subjects: [
        { ...newSubjectTemplate, subjectName: 'Sample Subject' } // ID will be added in useEffect for new forms
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });
  
  React.useEffect(() => {
    if (initialValues) {
      form.reset(initialValues); // Populate form if editing existing gradesheet
    } else {
      // For new forms, set dynamic defaults client-side to avoid hydration issues
      if (typeof window !== 'undefined') { // Ensure this runs only on the client
        if (form.getValues('examDate') === "") {
          form.setValue('examDate', format(new Date(), "yyyy-MM-dd"));
        }
        if (form.getValues('academicYear') === "") {
          const currentYear = new Date().getFullYear();
          form.setValue('academicYear', `${currentYear}-${currentYear + 1}`);
        }
        const subjects = form.getValues('subjects');
        if (subjects.length > 0 && !subjects[0].id) { 
          form.setValue('subjects.0.id', crypto.randomUUID());
        }
      }
    }
  }, [initialValues, form]);


  const handleAddSubject = () => {
    append({
      ...newSubjectTemplate,
      id: crypto.randomUUID(), // Assign unique ID on client
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary/90 flex items-center"><User className="mr-2 h-5 w-5" />Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., S1001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="studentClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl><Input placeholder="e.g., Class 10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4"/>Roll No.</FormLabel>
                    <FormControl><Input placeholder="e.g., 25" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbolNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4"/>Symbol No. (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., 0012345A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><School className="mr-2 h-4 w-4"/>School Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Springfield High" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary/90 flex items-center"><Award className="mr-2 h-5 w-5" />Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select exam type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {GradeSheetExamTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl><Input placeholder="e.g., 2023-2024" {...field} /></FormControl>
                     <FormDescription>Format: YYYY-YYYY</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Exam Date</FormLabel>
                    <FormControl>
                       <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                      />
                    </FormControl>
                    <FormMessage className="mt-2"/>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary/90 flex items-center"><BookOpen className="mr-2 h-5 w-5" />Subject-wise Marks</CardTitle>
             <CardDescription>Add each subject and its corresponding marks. Obtained marks cannot be greater than Full Marks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md shadow-sm bg-background/50 space-y-3 relative">
                <FormLabel className="text-md font-medium text-primary/80">Subject {index + 1}</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.subjectName`}
                    render={({ field: subjectField }) => (
                      <FormItem>
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Mathematics" {...subjectField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.fullMarks`}
                    render={({ field: subjectField }) => (
                      <FormItem>
                        <FormLabel>Full Marks</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 100" {...subjectField} onChange={e => subjectField.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.passMarks`}
                    render={({ field: subjectField }) => (
                      <FormItem>
                        <FormLabel>Pass Marks</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 40" {...subjectField} onChange={e => subjectField.onChange(parseFloat(e.target.value) || 0)}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.obtainedMarks`}
                    render={({ field: subjectField }) => (
                      <FormItem>
                        <FormLabel>Obtained Marks</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 75" {...subjectField} onChange={e => subjectField.onChange(parseFloat(e.target.value) || 0)}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Hidden field for subject id, managed by the form logic */}
                <FormField
                    control={form.control}
                    name={`subjects.${index}.id`}
                    render={({ field: subjectField }) => (
                      <FormItem className="hidden">
                        <FormControl><Input type="hidden" {...subjectField} /></FormControl>
                      </FormItem>
                    )}
                  />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 h-auto"
                    aria-label="Remove subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSubject}
              className="mt-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
            {form.formState.errors.subjects && !form.formState.errors.subjects.message && (
                 <FormMessage className="text-sm font-medium text-destructive">
                   Please check for errors in the subject fields.
                 </FormMessage>
            )}
             {form.formState.errors.subjects?.root?.message && (
                 <FormMessage className="text-sm font-medium text-destructive">
                    {form.formState.errors.subjects.root.message}
                 </FormMessage>
            )}
            {form.formState.errors.subjects?.message && (
                 <FormMessage className="text-sm font-medium text-destructive">
                    {form.formState.errors.subjects.message}
                 </FormMessage>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing GradeSheet...
            </>
          ) : (
            "Generate GradeSheet"
          )}
        </Button>
      </form>
    </Form>
  );
}
