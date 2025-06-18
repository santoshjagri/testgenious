
import type { GenerateQuestionsInput as AIInputType, GenerateQuestionsOutput } from '@/ai/flows/generate-questions';
import { z } from 'zod';

export const SupportedLanguages = ["English", "Nepali", "Hindi"] as const;

export const questionPaperFormSchema = z.object({
  institutionName: z.string().optional(),
  institutionAddress: z.string().optional(),
  logo: z.instanceof(File).optional(),
  classLevel: z.string().min(1, "Class/Level is required."),
  subject: z.string().min(1, "Subject is required."),
  subjectCode: z.string().optional(),
  examType: z.string().min(1, "Exam type is required (e.g., Final, Unit Test)."),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1.").max(1000, "Total marks cannot exceed 1000."),
  passMarks: z.coerce.number().min(1, "Pass marks must be at least 1.").max(1000, "Pass marks cannot exceed 1000."),
  timeLimit: z.string().min(1, "Time limit is required. (e.g., 2 hours, 90 minutes)"),
  instructions: z.string().optional(),
  language: z.enum(SupportedLanguages).default("English"),
  generationMode: z.enum(['ai', 'manual']).default('ai'),

  // AI Generation Counts
  mcqCount: z.coerce.number().min(0).max(50).default(5),
  veryShortQuestionCount: z.coerce.number().min(0).max(30).default(0),
  fillInTheBlanksCount: z.coerce.number().min(0).max(30).default(0),
  trueFalseCount: z.coerce.number().min(0).max(30).default(0),
  shortQuestionCount: z.coerce.number().min(0).max(20).default(3),
  longQuestionCount: z.coerce.number().min(0).max(10).default(2),
  numericalPracticalCount: z.coerce.number().min(0).max(10).default(0),

  // Manual Question Entry
  manualMcqs: z.string().optional().describe("Enter one MCQ per line, including marks. E.g., What is 2+2? (1 mark)"),
  manualVeryShortQuestions: z.string().optional().describe("Enter one very short question per line, including marks."),
  manualFillInTheBlanks: z.string().optional().describe("Enter one fill-in-the-blank question per line, including marks."),
  manualTrueFalseQuestions: z.string().optional().describe("Enter one true/false question per line, including (True/False) and marks."),
  manualShortQuestions: z.string().optional().describe("Enter one short question per line, including marks."),
  manualLongQuestions: z.string().optional().describe("Enter one long question per line, including marks."),
  manualNumericalPracticalQuestions: z.string().optional().describe("Enter one numerical/practical question per line, including marks."),

}).refine(data => data.passMarks <= data.totalMarks, {
  message: "Pass marks cannot exceed total marks.",
  path: ["passMarks"],
});

export type QuestionPaperFormValues = z.infer<typeof questionPaperFormSchema>;

export type AppGenerateQuestionsInput = AIInputType & {
  logoDataUri?: string;
  language: (typeof SupportedLanguages)[number];
};


export interface StoredQuestionPaper {
  id: string; 
  dateGenerated: string; 
  formSnapshot: Omit<AppGenerateQuestionsInput, 'mcqCount' | 'veryShortQuestionCount' | 'shortQuestionCount' | 'longQuestionCount' | 'fillInTheBlanksCount' | 'trueFalseCount' | 'numericalPracticalCount'> & {
    generationMode?: 'ai' | 'manual'; // To know how it was created
    language: (typeof SupportedLanguages)[number];
  };
  generatedPaper: GenerateQuestionsOutput;
}

export type QuestionPaperDisplayFormData = Omit<AppGenerateQuestionsInput, 'mcqCount' | 'veryShortQuestionCount' | 'shortQuestionCount' | 'longQuestionCount' | 'fillInTheBlanksCount' | 'trueFalseCount' | 'numericalPracticalCount'> & {
    language: (typeof SupportedLanguages)[number];
  };
