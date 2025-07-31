
"use client";

import type * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionPaperFormSchema, type QuestionPaperFormValues, SupportedLanguages, ExamTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, FileText, Building, Type, Code, ListOrdered, PencilLine, ClipboardCheck, CalculatorIcon, FileSignature, MapPin, ImagePlus, FileQuestion, LanguagesIcon, Edit3, Sigma, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const languageToCodeMap: { [key: string]: string } = {
  "English": "en-US", "Nepali": "ne-NP", "Hindi": "hi-IN", "Spanish": "es-ES", 
  "French": "fr-FR", "German": "de-DE", "Chinese": "zh-CN", "Japanese": "ja-JP", 
  "Russian": "ru-RU", "Arabic": "ar-SA",
};


export function QuestionPaperForm({ onSubmit, isLoading, initialValues }: QuestionPaperFormProps) {
  const [showSymbols, setShowSymbols] = useState(false);
  const activeInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechField, setActiveSpeechField] = useState<keyof QuestionPaperFormValues | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsSpeechSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  
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
      generationMode: 'manual',
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
    }
  }, [initialValues, form]);
  
  const handleToggleSpeech = (fieldName: keyof QuestionPaperFormValues, fieldLabel: string) => {
    if (!isSpeechSupported) {
        toast({ title: "Unsupported Browser", description: "Voice input is not supported by your browser.", variant: "destructive" });
        return;
    }
    
    if (isListening && activeSpeechField === fieldName) {
        recognitionRef.current?.stop();
        return;
    }

    if (isListening) {
        recognitionRef.current?.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Hard-coding language to english, as the language field is removed.
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setIsListening(true);
        setActiveSpeechField(fieldName);
        toast({ title: `Listening for "${fieldLabel.replace('Questions', '')}"...`, description: "Speak your question. It will stop automatically when you pause." });
    };

    recognition.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                newTranscript += event.results[i][0].transcript + '\n';
            }
        }
        
        if (newTranscript) {
            const currentVal = form.getValues(fieldName) as string || '';
            const newVal = currentVal ? `${currentVal}${newTranscript}` : newTranscript;
            form.setValue(fieldName, newVal, { shouldValidate: true });
        }
    };

    recognition.onerror = (event) => {
        let message = `An error occurred: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            message = "Microphone access was denied. Please enable it in your browser settings.";
        }
        toast({ title: "Voice Input Error", description: message, variant: "destructive" });
    };
    
    recognition.onend = () => {
        setIsListening(false);
        setActiveSpeechField(null);
        recognitionRef.current = null;
    };

    recognition.start();
  };
  
  const handleSymbolClick = (symbol: string) => {
    const target = activeInputRef.current;
    if (!target) return;

    const fieldName = target.name as keyof QuestionPaperFormValues;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
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
             <div className="flex items-center gap-2">
                {showSymbolToggle && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowSymbols(!showSymbols)}>
                       <Sigma className="mr-2 h-4 w-4"/>
                       {showSymbols ? "Hide" : "Show"} Symbols
                    </Button>
                )}
                {isSpeechSupported && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className={cn("h-8 w-8", isListening && activeSpeechField === name && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                                    onClick={() => handleToggleSpeech(name, label)}
                                    disabled={isListening && activeSpeechField !== name && activeSpeechField !== null}
                                >
                                    {isListening && activeSpeechField === name ? <MicOff className="h-4 w-4"/> : <Mic className="h-4 w-4"/>}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isListening && activeSpeechField === name ? "Stop Recording" : "Record from Mic"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
             </div>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter questions here, one per line. Or click the mic to speak."
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

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl no-print">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex-grow">
                <CardTitle className="text-2xl sm:text-3xl font-headline text-primary flex items-center">
                  <FileText className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
                  ExamGenius
                </CardTitle>
                <CardDescription className="font-body text-sm sm:text-base">
                  {initialValues ? "Edit the details below to update your question paper." : "Fill in the details below to generate your comprehensive question paper."}
                </CardDescription>
            </div>
        </div>
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
                  <FormLabel className="flex items-center text-sm sm:text-base">Instructions for Students</FormLabel>
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

            <Card className="bg-secondary/30 border border-primary/20">
              <CardHeader className="p-0">
                <div className="p-3 sm:p-4">
                  <CardTitle className="text-lg sm:text-xl font-headline text-primary flex items-center"><Edit3 className="mr-2 h-5 w-5"/>Manual Question Entry</CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                      Type your questions directly, or click the microphone to use voice input.
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

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-md sm:text-lg py-2.5 sm:py-3" disabled={isLoading}>
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
