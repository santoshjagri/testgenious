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
import { Loader2, FileText } from 'lucide-react';

interface QuestionPaperFormProps {
  onSubmit: (values: QuestionPaperFormValues) => Promise<void>;
  isLoading: boolean;
}

export function QuestionPaperForm({ onSubmit, isLoading }: QuestionPaperFormProps) {
  const form = useForm<QuestionPaperFormValues>({
    resolver: zodResolver(questionPaperFormSchema),
    defaultValues: {
      classLevel: '',
      subject: '',
      totalMarks: 70,
      passMarks: 23,
      timeLimit: '2 hours',
      instructions: 'All questions are compulsory. Write neatly.',
      mcqCount: 5,
      shortQuestionCount: 3,
      longQuestionCount: 2,
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl no-print">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          TestPaperGenius
        </CardTitle>
        <CardDescription className="font-body">
          Fill in the details below to generate your question paper.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} />
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
                      <Input type="number" placeholder="e.g., 33" {...field} />
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
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., All questions are compulsory."
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-secondary/50 p-4">
              <CardHeader className="p-2">
                 <CardTitle className="text-lg font-headline">Question Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="mcqCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of MCQs</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                        <FormLabel>Short Answer Questions</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                        <FormLabel>Long Answer Questions</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
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
