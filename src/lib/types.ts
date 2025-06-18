
import type { GenerateQuestionsInput as AIInputType, GenerateQuestionsOutput } from '@/ai/flows/generate-questions';
import { z } from 'zod';

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
  mcqCount: z.coerce.number().min(0).max(50).default(5),
  veryShortQuestionCount: z.coerce.number().min(0).max(30).default(0),
  fillInTheBlanksCount: z.coerce.number().min(0).max(30).default(0),
  trueFalseCount: z.coerce.number().min(0).max(30).default(0),
  shortQuestionCount: z.coerce.number().min(0).max(20).default(3),
  longQuestionCount: z.coerce.number().min(0).max(10).default(2),
  numericalPracticalCount: z.coerce.number().min(0).max(10).default(0),
}).refine(data => data.passMarks <= data.totalMarks, {
  message: "Pass marks cannot exceed total marks.",
  path: ["passMarks"],
});

export type QuestionPaperFormValues = z.infer<typeof questionPaperFormSchema>;

// Extending AIInputType to include logoDataUri for internal app use (display, storage)
// The actual AI flow input type is defined in generate-questions.ts
export type AppGenerateQuestionsInput = AIInputType & {
  logoDataUri?: string;
};


// Storing the full input for fidelity, but excluding counts as they are part of the form for regeneration
// The generated paper itself contains the actual number of questions of each type.
export interface StoredQuestionPaper {
  id: string; // Unique ID for the paper
  dateGenerated: string; // ISO string format
  formSnapshot: Omit<AppGenerateQuestionsInput, 'mcqCount' | 'veryShortQuestionCount' | 'shortQuestionCount' | 'longQuestionCount' | 'fillInTheBlanksCount' | 'trueFalseCount' | 'numericalPracticalCount'>;
  generatedPaper: GenerateQuestionsOutput;
}

// This type is what QuestionPaperDisplay expects for its formData prop
export type QuestionPaperDisplayFormData = Omit<AppGenerateQuestionsInput, 'mcqCount' | 'veryShortQuestionCount' | 'shortQuestionCount' | 'longQuestionCount' | 'fillInTheBlanksCount' | 'trueFalseCount' | 'numericalPracticalCount'>;

