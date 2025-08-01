
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
import { Loader2, User, BookOpen, CalendarDays, Hash, School, Award, PlusCircle, Trash2, ImagePlus } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface GradeSheetFormProps {
  onSubmit: (values: GradeSheetFormValues) => Promise<void>;
  isLoading: boolean;
  initialValues: GradeSheetFormValues; // Changed to be non-optional
}

const newSubjectTemplate: Omit<SubjectMarkInput, 'id'> = {
  subjectName: '',
  theoryFullMarks: 100,
  theoryPassMarks: 40,
  theoryObtainedMarks: 0,
  practicalFullMarks: undefined,
  practicalPassMarks: undefined,
  practicalObtainedMarks: undefined,
};


export function GradeSheetForm({ onSubmit, isLoading, initialValues }: GradeSheetFormProps) {
  const form = useForm<GradeSheetFormValues>({
    resolver: zodResolver(gradeSheetFormSchema),
    // The form is now initialized directly with the values from the parent page.
    // The parent handles both new and editing scenarios.
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  // This effect ensures the form is reset if the initialValues prop changes,
  // which can happen if a user navigates between editing different items without a full page reload.
  React.useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);


  const handleAddSubject = () => {
    append({
      ...newSubjectTemplate,
      id: crypto.randomUUID(), 
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><School className="mr-2 h-5 w-5" />School & Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">School Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Springfield High" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...rest } }) => ( 
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base"><ImagePlus className="mr-2 h-4 w-4" />School Logo (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest} 
                        className="file:mr-2 file:py-1.5 file:px-3 sm:file:mr-4 sm:file:py-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">Upload a new logo to change it.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base"><User className="mr-2 h-4 w-4"/>Student Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Student ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., S1001" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="studentClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Class</FormLabel>
                    <FormControl><Input placeholder="e.g., Class 10" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base"><Hash className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/>Roll No. (Opt)</FormLabel>
                    <FormControl><Input placeholder="e.g., 25" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbolNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base"><Hash className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/>Symbol No. (Opt)</FormLabel>
                    <FormControl><Input placeholder="e.g., 0012345A" {...field} className="text-sm sm:text-base"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><Award className="mr-2 h-5 w-5" />Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Exam Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="text-sm sm:text-base"><SelectValue placeholder="Select exam type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {GradeSheetExamTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-sm sm:text-base">{type}</SelectItem>
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
                    <FormLabel className="text-sm sm:text-base">Academic Year</FormLabel>
                    <FormControl><Input placeholder="e.g., 2023-2024" {...field} className="text-sm sm:text-base"/></FormControl>
                     <FormDescription className="text-xs">Format: YYYY-YYYY</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
               <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1 sm:mb-1.5 text-sm sm:text-base flex items-center"><CalendarDays className="mr-2 h-4 w-4"/>Exam Date (A.D.)</FormLabel>
                    <FormControl>
                       <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="mt-1 sm:mt-2"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nepaliExamDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1 sm:mb-1.5 text-sm sm:text-base flex items-center"><CalendarDays className="mr-2 h-4 w-4"/>Exam Date (B.S.) (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2081-03-25" {...field} className="text-sm sm:text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary/90 flex items-center"><BookOpen className="mr-2 h-5 w-5" />Subject-wise Marks</CardTitle>
             <CardDescription className="text-sm sm:text-base">For each subject, enter theory and practical marks. Leave practical fields blank if not applicable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-3 sm:p-4 border rounded-md shadow-sm bg-background/50 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <FormField
                      control={form.control}
                      name={`subjects.${index}.subjectName`}
                      render={({ field: subjectField }) => (
                        <FormItem className="flex-grow">
                          <FormLabel className="text-md font-medium text-primary/80">Subject {index + 1}: Name</FormLabel>
                          <FormControl><Input placeholder="e.g., Mathematics" {...subjectField} className="text-sm sm:text-base"/></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="ml-2 mt-1 text-destructive hover:bg-destructive/10 p-1 h-auto"
                      aria-label="Remove subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {/* Theory Marks Section */}
                  <div className="space-y-2 border-r-0 md:border-r md:pr-4 border-dashed">
                      <Label className="text-sm font-semibold">Theory Marks</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <FormField control={form.control} name={`subjects.${index}.theoryFullMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Full</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(parseFloat(e.target.value) || 0)} className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name={`subjects.${index}.theoryPassMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Pass</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(parseFloat(e.target.value) || 0)} className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name={`subjects.${index}.theoryObtainedMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Obtained</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(parseFloat(e.target.value) || 0)} className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                      </div>
                  </div>

                  {/* Practical Marks Section */}
                  <div className="space-y-2">
                      <Label className="text-sm font-semibold">Practical Marks (Optional)</Label>
                      <div className="grid grid-cols-3 gap-2">
                          <FormField control={form.control} name={`subjects.${index}.practicalFullMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Full</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)} placeholder="Opt." className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                          <FormField control={form.control} name={`subjects.${index}.practicalPassMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Pass</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)} placeholder="Opt." className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                          <FormField control={form.control} name={`subjects.${index}.practicalObtainedMarks`} render={({ field: f }) => ( <FormItem><FormLabel className="text-xs">Obtained</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)} placeholder="Opt." className="text-xs"/></FormControl><FormMessage /></FormItem> )} />
                      </div>
                  </div>
                </div>

                <FormField
                    control={form.control}
                    name={`subjects.${index}.id`}
                    render={({ field: subjectField }) => (
                      <FormItem className="hidden">
                        <FormControl><Input type="hidden" {...subjectField} /></FormControl>
                      </FormItem>
                    )}
                  />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSubject}
              className="mt-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:text-primary w-full sm:w-auto text-sm sm:text-base"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
            {form.formState.errors.subjects && !form.formState.errors.subjects.message && (
                 <FormMessage className="text-xs sm:text-sm font-medium text-destructive">
                   Please check for errors in the subject fields.
                 </FormMessage>
            )}
             {form.formState.errors.subjects?.root?.message && (
                 <FormMessage className="text-xs sm:text-sm font-medium text-destructive">
                    {form.formState.errors.subjects.root.message}
                 </FormMessage>
            )}
            {form.formState.errors.subjects?.message && (
                 <FormMessage className="text-xs sm:text-sm font-medium text-destructive">
                    {form.formState.errors.message}
                 </FormMessage>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-md sm:text-lg py-2.5 sm:py-3" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              {initialValues.studentName ? "Updating GradeSheet..." : "Processing GradeSheet..."}
            </>
          ) : (
             initialValues.studentName ? "Update GradeSheet" : "Generate GradeSheet"
          )}
        </Button>
      </form>
    </Form>
  );
}
