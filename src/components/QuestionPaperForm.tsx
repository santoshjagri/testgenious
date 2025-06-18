
"use client";

import type * as React from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionPaperFormSchema, type QuestionPaperFormValues, SupportedLanguages, ExamTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Loader2, FileText, Building, Type, Code, ListOrdered, PencilLine, ClipboardCheck, CalculatorIcon, FileSignature, MapPin, ImagePlus, FileQuestion, LanguagesIcon, Brain, Edit3, Lightbulb, MessageSquareText } from 'lucide-react';

interface QuestionPaperFormProps {
  onSubmit: (values: QuestionPaperFormValues) => Promise<void>;
  isLoading: boolean;
  initialValues?: QuestionPaperFormValues; // For editing
}

export function QuestionPaperForm({ onSubmit, isLoading, initialValues }: QuestionPaperFormProps) {
  const form = useForm<QuestionPaperFormValues>({
    resolver: zodResolver(questionPaperFormSchema),
    defaultValues: initialValues || { // Use initialValues if provided, otherwise fallback to defaults
      institutionName: 'TestPaperGenius Institute',
      institutionAddress: '',
      // logo: undefined, // File input cannot be set programmatically
      classLevel: '',
      subject: '',
      subjectCode: '',
      examType: 'Final Examination',
      totalMarks: 70,
      passMarks: 23,
      timeLimit: '2 hours',
      instructions: '1. All questions are compulsory.\n2. Marks are indicated against each question.\n3. Write neatly and legibly.',
      language: "English",
      customPrompt: '',
      generationMode: 'ai',
      mcqCount: 5,
      veryShortQuestionCount: 0,
      fillInTheBlanksCount: 0,
      trueFalseCount: 0,
      shortQuestionCount: 3,
      longQuestionCount: 2,
      numericalPracticalCount: 0,
      manualMcqs: "",
      manualVeryShortQuestions: "",
      manualFillInTheBlanks: "",
      manualTrueFalseQuestions: "",
      manualShortQuestions: "",
      manualLongQuestions: "",
      manualNumericalPracticalQuestions: "",
    },
  });

  // Effect to reset form when initialValues change (e.g., when loading a paper for editing)
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    } else {
      // Reset to default when not editing (e.g., "Create New Instead" is clicked)
      form.reset({
        institutionName: 'TestPaperGenius Institute',
        institutionAddress: '',
        logo: undefined, 
        classLevel: '',
        subject: '',
        subjectCode: '',
        examType: 'Final Examination',
        totalMarks: 70,
        passMarks: 23,
        timeLimit: '2 hours',
        instructions: '1. All questions are compulsory.\n2. Marks are indicated against each question.\n3. Write neatly and legibly.',
        language: "English",
        customPrompt: '',
        generationMode: 'ai',
        mcqCount: 5,
        veryShortQuestionCount: 0,
        fillInTheBlanksCount: 0,
        trueFalseCount: 0,
        shortQuestionCount: 3,
        longQuestionCount: 2,
        numericalPracticalCount: 0,
        manualMcqs: "",
        manualVeryShortQuestions: "",
        manualFillInTheBlanks: "",
        manualTrueFalseQuestions: "",
        manualShortQuestions: "",
        manualLongQuestions: "",
        manualNumericalPracticalQuestions: "",
      });
    }
  }, [initialValues, form]);


  const generationMode = useWatch({
    control: form.control,
    name: 'generationMode',
  });

  const manualQuestionField = (name: keyof QuestionPaperFormValues, label: string, icon: React.ReactNode, placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">{icon}{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="min-h-[100px] resize-y"
              {...field}
              value={field.value || ""} // Ensure value is not undefined
            />
          </FormControl>
          <FormDescription>Enter one question per line. Include marks, e.g., "Question text? (2 marks)".</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const aiCountField = (name: keyof QuestionPaperFormValues, label: string, icon: React.ReactNode, description?: string) => (
     <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">{icon}{label}</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value || 0} />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
  );


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl no-print">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          TestPaperGenius
        </CardTitle>
        <CardDescription className="font-body">
          {initialValues ? "Edit the details below to update your question paper." : "Fill in the details below to generate your comprehensive question paper."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Institution Details */}
            <div className="space-y-6">
              <CardTitle className="text-xl font-semibold border-b pb-2 text-primary/90">Institution Details</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4" />Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Springfield High School" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { onChange, value, ...rest } }) => ( // `value` here is the File object, which is fine for display but not for setting
                    <FormItem>
                      <FormLabel className="flex items-center"><ImagePlus className="mr-2 h-4 w-4" />Institution Logo (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => onChange(e.target.files?.[0])}
                          // Do not provide 'value' for file inputs as it's read-only and controlled by browser
                          {...rest} 
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormDescription>Upload your institution's logo (PNG, JPG, GIF). If editing, re-upload to change.</FormDescription>
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
                      <Textarea placeholder="e.g., 123 Main Street, Anytown, USA" className="resize-y min-h-[60px]" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Paper Basics */}
            <div className="space-y-6">
              <CardTitle className="text-xl font-semibold border-b pb-2 text-primary/90">Paper Basics</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="classLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class / Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Class 10, Grade 5" {...field} value={field.value || ""} />
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
                        <Input placeholder="e.g., Mathematics, Science" {...field} value={field.value || ""} />
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
                        <Input placeholder="e.g., MATH101, SCI-05" {...field} value={field.value || ""} />
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
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ExamTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><LanguagesIcon className="mr-2 h-4 w-4" />Language for Questions</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language for questions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SupportedLanguages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>AI will generate questions in this language. For manual entry, type in your chosen language.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Marks & Time */}
            <div className="space-y-6">
              <CardTitle className="text-xl font-semibold border-b pb-2 text-primary/90">Marks & Time</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value || 0} />
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
                        <Input type="number" placeholder="e.g., 33" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value || 0}/>
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
                        <Input placeholder="e.g., 2 hours, 90 minutes" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MessageSquareText className="mr-2 h-4 w-4" />Instructions for Students</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., All questions are compulsory. Marks are indicated..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Generation Method */}
            <FormField
              control={form.control}
              name="generationMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" />Question Generation Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ai" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center"><Brain className="mr-2 h-4 w-4"/>AI Generate Questions</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="manual" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center"><Edit3 className="mr-2 h-4 w-4"/>Manually Enter Questions</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* AI Specific Fields */}
            {generationMode === 'ai' && (
              <Card className="bg-secondary/30 p-4 border border-primary/20">
                <CardHeader className="p-2">
                   <CardTitle className="text-xl font-headline text-primary">AI Question Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-6">
                    <FormField
                      control={form.control}
                      name="customPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Lightbulb className="mr-2 h-4 w-4" />Specific Instructions/Topics for AI (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Focus on Chapter 5, or include questions about renewable energy."
                              className="min-h-[80px] resize-y"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                           <FormDescription>Provide keywords, topics, or specific instructions to guide the AI.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <CardDescription className="pt-4 border-t">Specify the number of questions for each type for AI generation.</CardDescription>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiCountField("mcqCount", "MCQs", <ListOrdered className="mr-2 h-4 w-4" />)}
                    {aiCountField("veryShortQuestionCount", "Very Short Answer", <FileQuestion className="mr-2 h-4 w-4" />)}
                    {aiCountField("fillInTheBlanksCount", "Fill in the Blanks", <PencilLine className="mr-2 h-4 w-4" />)}
                    {aiCountField("trueFalseCount", "True/False", <ClipboardCheck className="mr-2 h-4 w-4" />)}
                    {aiCountField("shortQuestionCount", "Short Answer", <FileText className="mr-2 h-4 w-4" />)}
                    {aiCountField("longQuestionCount", "Long Answer", <FileSignature className="mr-2 h-4 w-4" />)}
                    {aiCountField("numericalPracticalCount", "Numerical/Practical", <CalculatorIcon className="mr-2 h-4 w-4" />, "If applicable to subject.")}
                   </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Entry Fields */}
            {generationMode === 'manual' && (
              <Card className="bg-secondary/30 p-4 border border-primary/20">
                <CardHeader className="p-2">
                   <CardTitle className="text-xl font-headline text-primary">Manual Question Entry</CardTitle>
                   <CardDescription>Type your questions directly into the text areas below. One question per line.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-6">
                  {manualQuestionField("manualMcqs", "Multiple Choice Questions", <ListOrdered className="mr-2 h-4 w-4" />, "E.g., What is the capital of Nepal? (1 mark)\nA. Kathmandu\nB. Pokhara\nC. Biratnagar\nD. Bhaktapur" )}
                  {manualQuestionField("manualVeryShortQuestions", "Very Short Answer Questions", <FileQuestion className="mr-2 h-4 w-4" />, "E.g., What is your name? (1 mark)")}
                  {manualQuestionField("manualFillInTheBlanks", "Fill in the Blanks", <PencilLine className="mr-2 h-4 w-4" />, "E.g., The sun rises in the ____. (1 mark)")}
                  {manualQuestionField("manualTrueFalseQuestions", "True/False Questions", <ClipboardCheck className="mr-2 h-4 w-4" />, "E.g., The Earth is flat. (True/False) (1 mark)")}
                  {manualQuestionField("manualShortQuestions", "Short Answer Questions", <FileText className="mr-2 h-4 w-4" />, "E.g., Define a noun with an example. (3 marks)")}
                  {manualQuestionField("manualLongQuestions", "Long Answer Questions", <FileSignature className="mr-2 h-4 w-4" />, "E.g., Describe the process of photosynthesis in detail. (5 marks)")}
                  {manualQuestionField("manualNumericalPracticalQuestions", "Numerical/Practical Questions", <CalculatorIcon className="mr-2 h-4 w-4" />, "E.g., Calculate the area of a rectangle with length 5cm and width 3cm. (2 marks)")}
                </CardContent>
              </Card>
            )}


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {initialValues ? "Updating Paper..." : "Generating Paper..."}
                </>
              ) : (
                initialValues ? "Update Question Paper" : "Generate Question Paper"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

