
import type { GenerateQuestionsOutput } from '@/ai/flows/generate-questions';
import { z } from 'zod';

export const SupportedLanguages = [
  "English",
  "Nepali",
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Assamese",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Burmese",
  "Catalan",
  "Cebuano",
  "Chichewa",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dari",
  "Dutch",
  "Dzongkha",
  "Esperanto",
  "Estonian",
  "Ewe",
  "Filipino",
  "Finnish",
  "French",
  "Fula",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian Creole",
  "Hausa",
  "Hawaiian",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Ilocano",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Kinyarwanda",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Norwegian",
  "Nyanja",
  "Odia",
  "Oromo",
  "Pashto",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Quechua",
  "Romanian",
  "Russian",
  "Samoan",
  "Sanskrit",
  "Serbian",
  "Sesotho",
  "Shona",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Tibetan",
  "Tigrinya",
  "Tonga",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Venda",
  "Vietnamese",
  "Welsh",
  "Wolof",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zulu",
] as const;
export const ExamTypes = ["First Term", "Mid Term", "Final Examination"] as const;

export const questionPaperFormSchema = z.object({
  institutionName: z.string().optional(),
  institutionAddress: z.string().optional(),
  logo: z.instanceof(File).optional(),
  classLevel: z.string().min(1, "Class/Level is required."),
  subject: z.string().min(1, "Subject is required."),
  subjectCode: z.string().optional(),
  examType: z.enum(ExamTypes).default("Final Examination"),
  manualDate: z.string().optional().describe("Optional manual date for the paper, e.g., YYYY-MM-DD"),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1.").max(1000, "Total marks cannot exceed 1000."),
  passMarks: z.coerce.number().min(1, "Pass marks must be at least 1.").max(1000, "Pass marks cannot exceed 1000."),
  timeLimit: z.string().min(1, "Time limit is required. (e.g., 2 hours, 90 minutes)"),
  instructions: z.string().optional(),
  
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

export type StorableQuestionPaperFormValues = Omit<QuestionPaperFormValues, 'logo'> & {
  logoDataUri?: string;
};

export interface StoredQuestionPaper {
  id: string;
  dateGenerated: string;
  formSnapshot: StorableQuestionPaperFormValues;
  generatedPaper: GenerateQuestionsOutput;
}

export type QuestionPaperDisplayFormData = StorableQuestionPaperFormValues;

// --- GradeSheet Types ---

export const GradeSheetExamTypes = ["First Term", "Mid Term", "Second Term", "Third Term", "Final Examination", "Unit Test", "Pre-Board"] as const;

export const subjectMarkSchema = z.object({
  id: z.string(),
  subjectName: z.string().min(1, "Subject name is required."),
  theoryFullMarks: z.coerce.number().min(1, "Full marks > 0").max(200, "Max 200"),
  theoryPassMarks: z.coerce.number().min(0, "Pass marks >= 0").max(200, "Max 200"),
  theoryObtainedMarks: z.coerce.number().min(0, "Obtained marks >= 0").max(200, "Max 200"),
  practicalFullMarks: z.coerce.number().min(0).max(100).optional(),
  practicalPassMarks: z.coerce.number().min(0).max(100).optional(),
  practicalObtainedMarks: z.coerce.number().min(0).max(100).optional(),
}).refine(data => data.theoryObtainedMarks <= data.theoryFullMarks, {
    message: "Theory obtained marks cannot exceed full marks.",
    path: ["theoryObtainedMarks"],
}).refine(data => data.theoryPassMarks <= data.theoryFullMarks, {
    message: "Theory pass marks cannot exceed full marks.",
    path: ["theoryPassMarks"],
}).refine(data => {
    if (data.practicalFullMarks && data.practicalObtainedMarks !== undefined) {
        return data.practicalObtainedMarks <= data.practicalFullMarks;
    }
    return true;
}, {
    message: "Practical obtained marks cannot exceed full marks.",
    path: ["practicalObtainedMarks"],
}).refine(data => {
    if (data.practicalFullMarks && data.practicalPassMarks !== undefined) {
        return data.practicalPassMarks <= data.practicalFullMarks;
    }
    return true;
}, {
    message: "Practical pass marks cannot exceed full marks.",
    path: ["practicalPassMarks"],
});


export type SubjectMarkInput = z.infer<typeof subjectMarkSchema>;

export const gradeSheetFormSchema = z.object({
  studentId: z.string().optional(),
  symbolNo: z.string().optional(),
  studentName: z.string().min(1, "Student name is required."),
  studentClass: z.string().min(1, "Class is required."),
  rollNo: z.string().optional(),
  schoolName: z.string().min(1, "School name is required."),
  logo: z.instanceof(File).optional(),
  examType: z.enum(GradeSheetExamTypes).default("Final Examination"),
  academicYear: z.string().min(1, "Academic year is required (e.g., 2023-2024).")
                   .regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY (e.g., 2023-2024)."),
  examDate: z.string().min(1, "Exam date is required."),
  nepaliExamDate: z.string().optional(),
  subjects: z.array(subjectMarkSchema).min(1, "At least one subject is required."),
});

export type GradeSheetFormValues = z.infer<typeof gradeSheetFormSchema>;

// Represents the data structure for displaying and storing a complete gradesheet.
export interface CalculatedGradeSheetResult extends Omit<GradeSheetFormValues, 'logo'> {
  logoDataUri?: string;
  totalObtainedMarks: number;
  totalFullMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  resultStatus: "Pass" | "Fail" | "N/A";
  remarks?: string;
  individualSubjectStatus: Array<{ subjectName: string; status: "Pass" | "Fail" }>;
}

export interface StoredGradeSheet {
  id: string;
  dateGenerated: string; // ISO string
  gradesheetData: CalculatedGradeSheetResult;
}

export interface GradeSheetCalculationOutput {
  totalObtainedMarks: number;
  totalFullMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  resultStatus: "Pass" | "Fail" | "N/A";
  remarks?: string;
  individualSubjectStatus: Array<{ subjectName: string; status: "Pass" | "Fail" }>;
}


// --- Bulk GradeSheet Types ---

export const bulkStudentSchema = z.object({
  id: z.string(),
  studentId: z.string().optional(),
  symbolNo: z.string().optional(),
  studentName: z.string().min(1, "Name is required."),
  rollNo: z.string().optional(),
  obtainedMarks: z.record(z.object({
      theory: z.coerce.number().min(0, ">=0").default(0),
      practical: z.coerce.number().min(0, ">=0").optional(),
  })),
});

export const bulkSubjectSchema = z.object({
  id: z.string(),
  subjectName: z.string().min(1, "Subject name is required."),
  theoryFullMarks: z.coerce.number().min(1, "Full > 0"),
  theoryPassMarks: z.coerce.number().min(0, "Pass >= 0"),
  practicalFullMarks: z.coerce.number().min(0).max(100).optional(),
  practicalPassMarks: z.coerce.number().min(0).max(100).optional(),
}).refine(data => data.theoryPassMarks <= data.theoryFullMarks, {
    message: "Theory Pass marks cannot exceed Full marks.",
    path: ["theoryPassMarks"],
}).refine(data => {
    if (data.practicalFullMarks && data.practicalPassMarks !== undefined) {
        return data.practicalPassMarks <= data.practicalFullMarks;
    }
    return true;
}, {
    message: "Practical Pass marks cannot exceed full marks.",
    path: ["practicalPassMarks"],
});

export const bulkGradeSheetFormSchema = z.object({
  schoolName: z.string().min(1, "School name is required."),
  logo: z.instanceof(File).optional(),
  studentClass: z.string().min(1, "Class is required."),
  examType: z.enum(GradeSheetExamTypes).default("Final Examination"),
  academicYear: z.string().min(1, "Academic year is required.").regex(/^\d{4}-\d{4}$/, "Format: YYYY-YYYY"),
  examDate: z.string().min(1, "Exam date is required."),
  nepaliExamDate: z.string().optional(),
  subjects: z.array(bulkSubjectSchema).min(1, "At least one subject is required."),
  students: z.array(bulkStudentSchema).min(1, "At least one student is required."),
}).refine(data => {
  for (const student of data.students) {
    for (const subjectId in student.obtainedMarks) {
      const subject = data.subjects.find(s => s.id === subjectId);
      if (subject) {
         const marks = student.obtainedMarks[subjectId];
         if (marks.theory > subject.theoryFullMarks) {
             return false;
         }
         if (subject.practicalFullMarks && marks.practical !== undefined) {
             if (marks.practical > subject.practicalFullMarks) {
                 return false;
             }
         }
      }
    }
  }
  return true;
}, {
  message: "Obtained marks cannot be greater than Full Marks for any subject.",
  path: ["students"],
});

export type BulkGradeSheetFormValues = z.infer<typeof bulkGradeSheetFormSchema>;


// --- ID Card Types ---

export const IDCardTemplateArray = ["Classic", "Modern", "Vibrant", "Elegant"] as const;
export type IDCardTemplate = (typeof IDCardTemplateArray)[number];


export const idCardFormSchema = z.object({
  template: z.enum(IDCardTemplateArray).default("Classic"),
  
  // Institution Details
  institutionName: z.string().min(1, "Institution name is required."),
  logo: z.instanceof(File).optional(),
  
  // Card Holder Details
  photo: z.instanceof(File).optional(),
  fullName: z.string().min(1, "Full name is required."),
  classOrCourse: z.string().min(1, "This field is required."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  
  // Validity & Contact
  issueDate: z.string().min(1, "Issue date is required."),
  expiryDate: z.string().min(1, "Expiry date is required."),
  holderAddress: z.string().min(1, "Address is required."),
  
  // Customization
  headerColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontColor: z.string().optional(),

}).superRefine((data, ctx) => {
    if (new Date(data.expiryDate) <= new Date(data.issueDate)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expiry date must be after the issue date.",
            path: ["expiryDate"],
        });
    }
});

export type IDCardFormValues = z.infer<typeof idCardFormSchema>;

export type StoredIDCardData = Omit<IDCardFormValues, 'logo' | 'photo'> & {
  logoDataUri?: string;
  photoDataUri: string;
};

export interface StoredIDCard {
  id: string;
  dateGenerated: string; // ISO string
  cardData: StoredIDCardData;
}
