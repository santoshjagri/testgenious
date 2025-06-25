
"use client";

import type * as React from 'react';
import { useEffect, useState, useRef } from 'react';
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
import { Loader2, FileText, Building, Type, Code, ListOrdered, PencilLine, ClipboardCheck, CalculatorIcon, FileSignature, MapPin, ImagePlus, FileQuestion, LanguagesIcon, Brain, Edit3, Lightbulb, MessageSquareText, Sparkles, CalendarIcon, Sigma } from 'lucide-react';
import { generateQuestions, type GenerateQuestionsInput, type GenerateQuestionsOutput } from '@/ai/flows/generate-questions';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const categorizedSymbols = {
  "Arithmetic Symbols": [
    { symbol: "+", name: "Plus" }, { symbol: "−", name: "Minus" }, { symbol: "×", name: "Multiply" }, 
    { symbol: "÷", name: "Divide" }, { symbol: "=", name: "Equals" }, { symbol: "≠", name: "Not Equal" },
    { symbol: "<", name: "Less Than" }, { symbol: ">", name: "Greater Than" }, { symbol: "≤", name: "Less Than or Equal" },
    { symbol: "≥", name: "Greater Than or Equal" }, { symbol: "±", name: "Plus-Minus" }, { symbol: "∓", name: "Minus-Plus" }
  ],
  "Algebraic Symbols": [
    { symbol: "x", name: "x variable" }, { symbol: "y", name: "y variable" }, { symbol: "z", name: "z variable" },
    { symbol: "ƒ", name: "Function" }, { symbol: "∝", name: "Proportional to" }, { symbol: "∞", name: "Infinity" }
  ],
  "Set Theory Symbols": [
    { symbol: "∈", name: "Element of" }, { symbol: "∉", name: "Not an Element of" }, { symbol: "⊂", name: "Subset of" },
    { symbol: "⊃", name: "Superset of" }, { symbol: "⊆", name: "Subset of or equal to" }, { symbol: "⊇", name: "Superset of or equal to" },
    { symbol: "∩", name: "Intersection" }, { symbol: "∪", name: "Union" }, { symbol: "∅", name: "Empty Set" }
  ],
  "Logic and Reasoning Symbols": [
    { symbol: "∀", name: "For All" }, { symbol: "∃", name: "There Exists" }, { symbol: "∴", name: "Therefore" },
    { symbol: "∵", name: "Because" }, { symbol: "∧", name: "Logical AND" }, { symbol: "∨", name: "Logical OR" },
    { symbol: "¬", name: "Logical NOT" }
  ],
  "Geometry Symbols": [
    { symbol: "°", name: "Degree" }, { symbol: "∠", name: "Angle" }, { symbol: "⊥", name: "Perpendicular" },
    { symbol: "∥", name: "Parallel" }, { symbol: "∆", name: "Triangle" }, { symbol: "π", name: "Pi" }
  ],
  "Calculus Symbols": [
    { symbol: "∫", name: "Integral" }, { symbol: "∂", name: "Partial Derivative" }, { symbol: "∇", name: "Nabla" },
    { symbol: "∑", name: "Summation" }, { symbol: "d/dx", name: "Derivative" }, { symbol: "lim", name: "Limit" }
  ],
  "Vectors and Matrices Symbols": [
    { symbol: "→", name: "Vector Arrow" }, { symbol: "⟨", name: "Angle bracket left" }, { symbol: "⟩", name: "Angle bracket right" },
    { symbol: "·", name: "Dot Product" }, { symbol: "×", name: "Cross Product" }
  ],
  "Number System Symbols": [
    { symbol: "ℕ", name: "Natural Numbers" }, { symbol: "ℤ", name: "Integers" }, { symbol: "ℚ", name: "Rational Numbers" },
    { symbol: "ℝ", name: "Real Numbers" }, { symbol: "ℂ", name: "Complex Numbers" }
  ],
  "Function and Operator Symbols": [
    { symbol: "ƒ(x)", name: "Function of x" }, { symbol: "g(x)", name: "Function of x" }, { symbol: "log", name: "Logarithm" },
    { symbol: "ln", name: "Natural Logarithm" }, { symbol: "sin", name: "Sine" }, { symbol: "cos", name: "Cosine" }, { symbol: "tan", name: "Tangent" }
  ],
  "Probability and Statistics Symbols": [
    { symbol: "P(A)", name: "Probability of A" }, { symbol: "E(X)", name: "Expected Value" }, { symbol: "μ", name: "Mean" },
    { symbol: "σ", name: "Standard Deviation" }, { symbol: "σ²", name: "Variance" }
  ],
  "Physics Symbols": [
    { symbol: "F", name: "Force" }, { symbol: "E", name: "Energy/Electric Field" }, { symbol: "v", name: "Velocity" },
    { symbol: "a", name: "Acceleration" }, { symbol: "p", name: "Momentum" }, { symbol: "W", name: "Work/Watt" },
    { symbol: "λ", name: "Wavelength" }, { symbol: "ω", name: "Angular Velocity" }, { symbol: "ρ", name: "Density" },
    { symbol: "g", name: "Gravity" }, { symbol: "c", name: "Speed of Light" }, { symbol: "h", name: "Planck's Constant" },
    { symbol: "ε₀", name: "Permittivity" }, { symbol: "μ₀", name: "Permeability" }, { symbol: "N", name: "Newton" },
    { symbol: "J", name: "Joule" }, { symbol: "V", name: "Volt" }, { symbol: "Ω", name: "Ohm" },
  ],
  "Chemistry Symbols": [
    { symbol: "→", name: "Yields" }, { symbol: "⇌", name: "Reversible Reaction" }, { symbol: "∆", name: "Heat/Change" },
    { symbol: "↑", name: "Gas Evolved" }, { symbol: "↓", name: "Precipitate Formed" }, { symbol: "e⁻", name: "Electron" },
    { symbol: "p⁺", name: "Proton" }, { symbol: "n⁰", name: "Neutron" }, { symbol: "A", name: "Mass Number" },
    { symbol: "Z", name: "Atomic Number" }, { symbol: "[X]", name: "Concentration of X" }, { symbol: "M", name: "Molarity" },
    { symbol: "mol", name: "Mole" }, { symbol: "ΔH", name: "Enthalpy Change" }, { symbol: "ΔS", name: "Entropy Change" },
    { symbol: "Kₐ", name: "Acid Dissociation Constant" }, { symbol: "pH", name: "pH" }, { symbol: "R-", name: "Organic Group" }
  ],
  "Arrows and Miscellaneous Symbols": [
    { symbol: "→", name: "Right Arrow" }, { symbol: "←", name: "Left Arrow" }, { symbol: "↔", name: "Left-Right Arrow" },
    { symbol: "⇒", name: "Rightwards Double Arrow" }, { symbol: "⇔", name: "Left-Right Double Arrow" }, { symbol: "↑", name: "Up Arrow" },
    { symbol: "↓", name: "Down Arrow" }, { symbol: "√", name: "Square Root" }, { symbol: "∛", name: "Cube Root" }
  ],
  "Greek Letters": [
    { symbol: "α", name: "Alpha" }, { symbol: "β", name: "Beta" }, { symbol: "γ", name: "Gamma" }, { symbol: "δ", name: "Delta" },
    { symbol: "ε", name: "Epsilon" }, { symbol: "ζ", name: "Zeta" }, { symbol: "η", name: "Eta" }, { symbol: "θ", name: "Theta" },
    { symbol: "ι", name: "Iota" }, { symbol: "κ", name: "Kappa" }, { symbol: "λ", name: "Lambda" }, { symbol: "μ", name: "Mu" },
    { symbol: "ν", name: "Nu" }, { symbol: "ξ", name: "Xi" }, { symbol: "ο", name: "Omicron" }, { symbol: "π", name: "Pi" },
    { symbol: "ρ", name: "Rho" }, { symbol: "σ", name: "Sigma" }, { symbol: "τ", name: "Tau" }, { symbol: "υ", name: "Upsilon" },
    { symbol: "φ", name: "Phi" }, { symbol: "χ", name: "Chi" }, { symbol: "ψ", name: "Psi" }, { symbol: "ω", name: "Omega" },
    { symbol: "Α", name: "Capital Alpha" }, { symbol: "Β", name: "Capital Beta" }, { symbol: "Γ", name: "Capital Gamma" }, { symbol: "Δ", name: "Capital Delta" },
    { symbol: "Ε", name: "Capital Epsilon" }, { symbol: "Ζ", name: "Capital Zeta" }, { symbol: "Η", name: "Capital Eta" }, { symbol: "Θ", name: "Capital Theta" },
    { symbol: "Ι", name: "Capital Iota" }, { symbol: "Κ", name: "Capital Kappa" }, { symbol: "Λ", name: "Capital Lambda" }, { symbol: "Μ", name: "Capital Mu" },
    { symbol: "Ν", name: "Capital Nu" }, { symbol: "Ξ", name: "Capital Xi" }, { symbol: "Ο", name: "Capital Omicron" }, { symbol: "Π", name: "Capital Pi" },
    { symbol: "Ρ", name: "Capital Rho" }, { symbol: "Σ", name: "Capital Sigma" }, { symbol: "Τ", name: "Capital Tau" }, { symbol: "Υ", name: "Capital Upsilon" },
    { symbol: "Φ", name: "Capital Phi" }, { symbol: "Χ", name: "Capital Chi" }, { symbol: "Ψ", name: "Capital Psi" }, { symbol: "Ω", name: "Capital Omega" }
  ]
};

const SymbolPalette = ({ onSymbolClick }: { onSymbolClick: (symbol: string) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categorizedSymbols)[0]);

  return (
    <div className="flex flex-col space-y-2 p-2">
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select a symbol category" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(categorizedSymbols).map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="overflow-x-auto">
        <div className="flex items-center space-x-1 whitespace-nowrap p-1">
          {categorizedSymbols[selectedCategory as keyof typeof categorizedSymbols].map((symbol, index) => (
            <TooltipProvider key={index} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-2 h-9 w-9 text-base font-serif"
                    onClick={() => onSymbolClick(symbol.symbol)}
                  >
                    {symbol.symbol}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{symbol.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};


interface QuestionPaperFormProps {
  onSubmit: (values: QuestionPaperFormValues) => Promise<void>;
  isLoading: boolean;
  initialValues?: QuestionPaperFormValues; 
}

export function QuestionPaperForm({ onSubmit, isLoading, initialValues }: QuestionPaperFormProps) {
  const [isProcessingAiToManual, setIsProcessingAiToManual] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const activeInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  
  const form = useForm<QuestionPaperFormValues>({
    resolver: zodResolver(questionPaperFormSchema),
    defaultValues: initialValues || { 
      institutionName: 'ExamGenius AI Institute',
      institutionAddress: '',
      classLevel: '',
      subject: '',
      subjectCode: '',
      examType: 'Final Examination',
      manualDate: '',
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

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    } else {
      form.reset({
        institutionName: 'ExamGenius AI Institute',
        institutionAddress: '',
        logo: undefined, 
        classLevel: '',
        subject: '',
        subjectCode: '',
        examType: 'Final Examination',
        manualDate: '',
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

  const handleProcessAiToManual = async () => {
    setIsProcessingAiToManual(true);
    const values = form.getValues();

    const aiInput: GenerateQuestionsInput = {
      classLevel: values.classLevel,
      subject: values.subject,
      totalMarks: values.totalMarks,
      passMarks: values.passMarks,
      timeLimit: values.timeLimit,
      instructions: values.instructions || 'All questions are compulsory.',
      examType: values.examType,
      institutionName: values.institutionName || 'ExamGenius AI Institute',
      institutionAddress: values.institutionAddress || '',
      subjectCode: values.subjectCode || '',
      language: values.language,
      customPrompt: values.customPrompt,
      mcqCount: values.mcqCount,
      veryShortQuestionCount: values.veryShortQuestionCount,
      shortQuestionCount: values.shortQuestionCount,
      longQuestionCount: values.longQuestionCount,
      fillInTheBlanksCount: values.fillInTheBlanksCount,
      trueFalseCount: values.trueFalseCount,
      numericalPracticalCount: values.numericalPracticalCount,
    };

    try {
      const result: GenerateQuestionsOutput = await generateQuestions(aiInput);
      
      form.setValue('manualMcqs', result.mcqs?.join('\n') || '');
      form.setValue('manualVeryShortQuestions', result.veryShortQuestions?.join('\n') || '');
      form.setValue('manualFillInTheBlanks', result.fillInTheBlanks?.join('\n') || '');
      form.setValue('manualTrueFalseQuestions', result.trueFalseQuestions?.join('\n') || '');
      form.setValue('manualShortQuestions', result.shortQuestions?.join('\n') || '');
      form.setValue('manualLongQuestions', result.longQuestions?.join('\n') || '');
      form.setValue('manualNumericalPracticalQuestions', result.numericalPracticalQuestions?.join('\n') || '');
      
      form.setValue('generationMode', 'manual');
      toast({
        title: "AI Draft Complete!",
        description: "Questions populated in manual fields. Review and edit as needed, then click 'Update/Generate Question Paper'.",
      });

    } catch (error) {
      console.error("Error processing AI to manual:", error);
      let errorMessage = "Failed to get AI draft. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.substring(0, 200);
      }
      toast({
        title: "AI Draft Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingAiToManual(false);
    }
  };
  
  const handleSymbolClick = (symbol: string) => {
    const target = activeInputRef.current;
    if (!target) return;

    const fieldName = target.name as keyof QuestionPaperFormValues;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = target.value;
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);

    form.setValue(fieldName, newValue, { shouldValidate: true });

    setTimeout(() => {
        target.focus();
        const newCursorPosition = start + symbol.length;
        target.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };


  const manualQuestionField = (name: keyof QuestionPaperFormValues, label: string, icon: React.ReactNode, showSymbolToggle = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel className="flex items-center text-sm sm:text-base">{icon}{label}</FormLabel>
            {showSymbolToggle && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSymbols(!showSymbols)}>
                   <Sigma className="mr-2 h-4 w-4"/>
                   {showSymbols ? "Hide" : "Show"} Symbols
                </Button>
            )}
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter questions here, one per line."
              className="min-h-[80px] sm:min-h-[100px] resize-y text-sm sm:text-base"
              {...field}
              value={field.value as string || ""}
              onFocus={(e) => (activeInputRef.current = e.target)}
            />
          </FormControl>
          <FormDescription className="text-xs sm:text-sm">Include marks in brackets, e.g., What is force? (2 marks)</FormDescription>
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
            <FormLabel className="flex items-center text-sm sm:text-base">{icon}{label}</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value as number || 0} className="text-sm sm:text-base"/>
            </FormControl>
            {description && <FormDescription className="text-xs sm:text-sm">{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
  );


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl no-print">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-2xl sm:text-3xl font-headline text-primary flex items-center">
          <FileText className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
          ExamGenius AI
        </CardTitle>
        <CardDescription className="font-body text-sm sm:text-base">
          {initialValues ? "Edit the details below to update your question paper." : "Fill in the details below to generate your comprehensive question paper."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            
            <div className="space-y-4 sm:space-y-6">
              <CardTitle className="text-lg sm:text-xl font-semibold border-b pb-2 text-primary/90">Institution Details</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm sm:text-base"><Building className="mr-2 h-4 w-4" />Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Springfield High School" {...field} value={field.value || ""} className="text-sm sm:text-base" />
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
                      <FormLabel className="flex items-center text-sm sm:text-base"><ImagePlus className="mr-2 h-4 w-4" />Institution Logo (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...rest} 
                          className="file:mr-2 file:py-1.5 file:px-3 sm:file:mr-4 sm:file:py-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">Upload your institution's logo (PNG, JPG, GIF). If editing, re-upload to change.</FormDescription>
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
                    <FormLabel className="flex items-center text-sm sm:text-base"><MapPin className="mr-2 h-4 w-4" />Institution Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 123 Main Street, Anytown, USA" className="resize-y min-h-[50px] sm:min-h-[60px] text-sm sm:text-base" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <CardTitle className="text-lg sm:text-xl font-semibold border-b pb-2 text-primary/90">Paper Basics</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="classLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Class / Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Class 10, Grade 5" {...field} value={field.value || ""} className="text-sm sm:text-base"/>
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
                      <FormLabel className="text-sm sm:text-base">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics, Science" {...field} value={field.value || ""} className="text-sm sm:text-base"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="subjectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm sm:text-base"><Code className="mr-2 h-4 w-4" />Subject Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MATH101, SCI-05" {...field} value={field.value || ""} className="text-sm sm:text-base"/>
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
                      <FormLabel className="flex items-center text-sm sm:text-base"><Type className="mr-2 h-4 w-4" />Exam Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ExamTypes.map(type => (
                            <SelectItem key={type} value={type} className="text-sm sm:text-base">{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm sm:text-base"><LanguagesIcon className="mr-2 h-4 w-4" />Language for Questions</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select language for questions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SupportedLanguages.map(lang => (
                            <SelectItem key={lang} value={lang} className="text-sm sm:text-base">{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs sm:text-sm">AI will generate questions in this language. For manual entry, type in your chosen language.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manualDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm sm:text-base"><CalendarIcon className="mr-2 h-4 w-4" />Paper Date (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024-07-15" {...field} value={field.value || ""} className="text-sm sm:text-base"/>
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">Enter if specific date needed. Else, today's date is used.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <CardTitle className="text-lg sm:text-xl font-semibold border-b pb-2 text-primary/90">Marks & Time</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Total Marks</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value || 0} className="text-sm sm:text-base"/>
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
                      <FormLabel className="text-sm sm:text-base">Pass Marks</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 33" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value || 0} className="text-sm sm:text-base"/>
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
                      <FormLabel className="text-sm sm:text-base">Time Limit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 hours, 90 minutes" {...field} value={field.value || ""} className="text-sm sm:text-base"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm sm:text-base"><MessageSquareText className="mr-2 h-4 w-4" />Instructions for Students</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., All questions are compulsory. Marks are indicated..."
                      className="resize-y min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generationMode"
              render={({ field }) => (
                <FormItem className="space-y-2 sm:space-y-3">
                  <FormLabel className="text-base sm:text-lg font-semibold flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" />Question Generation Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 sm:space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ai" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center text-sm sm:text-base"><Brain className="mr-2 h-4 w-4"/>AI Generate Questions</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 sm:space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="manual" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center text-sm sm:text-base"><Edit3 className="mr-2 h-4 w-4"/>Manually Enter Questions</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {generationMode === 'ai' && (
              <Card className="bg-secondary/30 p-3 sm:p-4 border border-primary/20">
                <CardHeader className="p-1 sm:p-2">
                   <CardTitle className="text-lg sm:text-xl font-headline text-primary">AI Question Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 space-y-4 sm:space-y-6">
                    <FormField
                      control={form.control}
                      name="customPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-sm sm:text-base"><Lightbulb className="mr-2 h-4 w-4" />Specific Instructions/Topics for AI (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Focus on Chapter 5, or include questions about renewable energy."
                              className="min-h-[70px] sm:min-h-[80px] resize-y text-sm sm:text-base"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                           <FormDescription className="text-xs sm:text-sm">Provide keywords, topics, or specific instructions to guide the AI.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <CardDescription className="pt-2 sm:pt-4 border-t text-sm sm:text-base">Specify the number of questions for each type for AI generation.</CardDescription>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {aiCountField("mcqCount", "MCQs", <ListOrdered className="mr-2 h-4 w-4" />)}
                    {aiCountField("veryShortQuestionCount", "Very Short Answer", <FileQuestion className="mr-2 h-4 w-4" />)}
                    {aiCountField("fillInTheBlanksCount", "Fill in the Blanks", <PencilLine className="mr-2 h-4 w-4" />)}
                    {aiCountField("trueFalseCount", "True/False", <ClipboardCheck className="mr-2 h-4 w-4" />)}
                    {aiCountField("shortQuestionCount", "Short Answer", <FileText className="mr-2 h-4 w-4" />)}
                    {aiCountField("longQuestionCount", "Long Answer", <FileSignature className="mr-2 h-4 w-4" />)}
                    {aiCountField("numericalPracticalCount", "Numerical/Practical", <CalculatorIcon className="mr-2 h-4 w-4" />, "If applicable to subject.")}
                   </div>
                   <div className="pt-2 sm:pt-4 border-t">
                      <Button 
                        type="button" 
                        onClick={handleProcessAiToManual} 
                        disabled={isProcessingAiToManual || isLoading}
                        variant="outline"
                        className="w-full text-sm sm:text-base"
                      >
                        {isProcessingAiToManual ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            Processing AI Draft...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Generate AI Draft
                          </>
                        )}
                      </Button>
                      <FormDescription className="mt-1 sm:mt-2 text-center text-xs sm:text-sm">
                        Click this to let AI generate questions based on the counts above and populate them into the 'Manually Enter Questions' section below. You can then edit them before final submission.
                      </FormDescription>
                   </div>
                </CardContent>
              </Card>
            )}

            {generationMode === 'manual' && (
              <Card className="bg-secondary/30 border border-primary/20">
                <CardHeader className="p-0">
                  <div className="p-3 sm:p-4">
                    <CardTitle className="text-lg sm:text-xl font-headline text-primary">Manual Question Entry</CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1">
                        Type your questions directly. If you used "AI Draft", questions appear below for editing.
                    </CardDescription>
                  </div>
                    {showSymbols && (
                        <div className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm shadow-md border-b border-t border-border">
                            <SymbolPalette onSymbolClick={handleSymbolClick} />
                        </div>
                    )}
                </CardHeader>
                 <CardContent className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                    {manualQuestionField("manualMcqs", "Multiple Choice Questions", <ListOrdered className="mr-2 h-4 w-4" />, true)}
                    {manualQuestionField("manualVeryShortQuestions", "Very Short Answer Questions", <FileQuestion className="mr-2 h-4 w-4" />)}
                    {manualQuestionField("manualFillInTheBlanks", "Fill in the Blanks", <PencilLine className="mr-2 h-4 w-4" />)}
                    {manualQuestionField("manualTrueFalseQuestions", "True/False Questions", <ClipboardCheck className="mr-2 h-4 w-4" />)}
                    {manualQuestionField("manualShortQuestions", "Short Answer Questions", <FileText className="mr-2 h-4 w-4" />)}
                    {manualQuestionField("manualLongQuestions", "Long Answer Questions", <FileSignature className="mr-2 h-4 w-4" />)}
                    {manualQuestionField("manualNumericalPracticalQuestions", "Numerical/Practical Questions", <CalculatorIcon className="mr-2 h-4 w-4" />)}
                 </CardContent>
              </Card>
            )}


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-md sm:text-lg py-2.5 sm:py-3" disabled={isLoading || isProcessingAiToManual}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
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
