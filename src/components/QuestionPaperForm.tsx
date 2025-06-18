
"use client";

import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionPaperFormSchema, type QuestionPaperFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileText, Building, Type, Code, ListOrdered, PencilLine, ClipboardCheck, CalculatorIcon, FileSignature, MapPin, ImagePlus, FileQuestion } from 'lucide-react';

interface QuestionPaperFormProps {
  onSubmit: (values: QuestionPaperFormValues) => Promise<void>;
  isLoading: boolean;
}

export function QuestionPaperForm({ onSubmit, isLoading }: QuestionPaperFormProps) {
  const form = useForm<QuestionPaperFormValues>({
    resolver: zodResolver(questionPaperFormSchema),
    defaultValues: {
      institutionName: 'TestPaperGenius Institute',
      institutionAddress: '',
      // logo: undefined, // Handled by file input
      classLevel: '',
      subject: '',
      subjectCode: '',
      examType: 'Final Examination',
      totalMarks: 70,
      passMarks: 23,
      timeLimit: '2 hours',
      instructions: '1. All questions are compulsory.\n2. Marks are indicated against each question.\n3. Write neatly and legibly.',
      mcqCount: 5,
      veryShortQuestionCount: 0,
      fillInTheBlanksCount: 0,
      trueFalseCount: 0,
      shortQuestionCount: 3,
      longQuestionCount: 2,
      numericalPracticalCount: 0,
    },
  });

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl no-print">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          TestPaperGenius
        </CardTitle>
        <CardDescription className="font-body">
          Fill in the details below to generate your comprehensive question paper.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="institutionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4" />Institution Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Springfield High School" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><ImagePlus className="mr-2 h-4 w-4" />Institution Logo (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest} 
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormDescription>Upload your institution's logo (PNG, JPG, GIF).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            

            <FormField
              control={form.control}
              name="institutionAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Institution Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 123 Main Street, Anytown, USA" className="resize-y min-h-[60px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="classLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class / Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Class 10, Grade 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mathematics, Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subjectCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Code className="mr-2 h-4 w-4" />Subject Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MATH101, SCI-05" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Type className="mr-2 h-4 w-4" />Exam Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Final, Unit Test, Midterm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pass Marks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 33" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours, 90 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions for Students</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., All questions are compulsory. Marks are indicated..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-secondary/30 p-4 border border-primary/20">
              <CardHeader className="p-2">
                 <CardTitle className="text-xl font-headline text-primary">Question Distribution</CardTitle>
                 <CardDescription>Specify the number of questions for each type.</CardDescription>
              </CardHeader>
              <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="mcqCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ListOrdered className="mr-2 h-4 w-4" />MCQs</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="veryShortQuestionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><FileQuestion className="mr-2 h-4 w-4" />Very Short Answer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fillInTheBlanksCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><PencilLine className="mr-2 h-4 w-4" />Fill in the Blanks</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trueFalseCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ClipboardCheck className="mr-2 h-4 w-4" />True/False</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shortQuestionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4" />Short Answer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longQuestionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><FileSignature className="mr-2 h-4 w-4" />Long Answer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numericalPracticalCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><CalculatorIcon className="mr-2 h-4 w-4" />Numerical/Practical</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormDescription>If applicable to subject.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Paper...
                </>
              ) : (
                'Generate Question Paper'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

