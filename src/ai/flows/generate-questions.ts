
'use server';

/**
 * @fileOverview Generates a diverse set of questions (MCQs, Very Short, Fill in the Blanks, True/False, short, long, numerical/practical) 
 * based on the specified subject, class level, and other paper parameters.
 *
 * - generateQuestions - A function that generates questions for a question paper.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  classLevel: z.string().describe('The class level for which to generate questions (e.g., Class 10, Level 3).'),
  subject: z.string().describe('The subject for which to generate questions (e.g., Mathematics, Science, English).'),
  totalMarks: z.number().describe('The total marks for the question paper.'),
  passMarks: z.number().describe('The pass marks for the question paper.'),
  timeLimit: z.string().describe('The time limit for the question paper (e.g., 2 hours, 90 minutes).'),
  instructions: z.string().describe('Any specific instructions for the question paper.'),
  examType: z.string().describe('The type of exam (e.g., Final, Unit Test, Entrance Exam).'),
  institutionName: z.string().optional().describe('The name of the institution. Defaults to "TestPaperGenius Institute" if not provided by user.'),
  institutionAddress: z.string().optional().describe('The address of the institution. e.g., "123 Main Street, Anytown, ST 12345".'),
  logoDataUri: z.string().optional().describe("A data URI of the institution's logo, if provided by the user."),
  subjectCode: z.string().optional().describe('The subject code for the paper.'),
  mcqCount: z.number().default(5).describe('Number of Multiple Choice Questions to generate.'),
  veryShortQuestionCount: z.number().default(0).describe('Number of Very Short Answer Questions to generate.'),
  fillInTheBlanksCount: z.number().default(0).describe('Number of Fill in the Blanks questions to generate.'),
  trueFalseCount: z.number().default(0).describe('Number of True/False questions to generate.'),
  shortQuestionCount: z.number().default(3).describe('Number of Short Questions to generate.'),
  longQuestionCount: z.number().default(2).describe('Number of Long Questions to generate.'),
  numericalPracticalCount: z.number().default(0).describe('Number of Numerical or Practical questions to generate (if applicable for the subject).'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const GenerateQuestionsOutputSchema = z.object({
  mcqs: z.array(z.string()).describe('An array of multiple-choice questions. Each question string should include its allocated marks, e.g., "What is 2+2? (1 mark)".'),
  veryShortQuestions: z.array(z.string()).optional().describe('An array of very short answer questions (1-2 sentences). Each question string should include its allocated marks. Include this array only if veryShortQuestionCount > 0.'),
  fillInTheBlanks: z.array(z.string()).optional().describe('An array of fill-in-the-blanks questions. Each question string should include its allocated marks. Include this array only if fillInTheBlanksCount > 0.'),
  trueFalseQuestions: z.array(z.string()).optional().describe('An array of true/false questions. Each question string should include "(True/False)" and its allocated marks. Include this array only if trueFalseCount > 0.'),
  shortQuestions: z.array(z.string()).describe('An array of short answer questions. Each question string should include its allocated marks.'),
  longQuestions: z.array(z.string()).describe('An array of long answer questions. Each question string should include its allocated marks.'),
  numericalPracticalQuestions: z.array(z.string()).optional().describe('An array of numerical or practical questions. Each question string should include its allocated marks. Include this array only if numericalPracticalCount > 0.'),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an expert educator tasked with creating a comprehensive and well-structured question paper.
The paper is for:
- Institution: {{#if institutionName}}{{institutionName}}{{else}}TestPaperGenius Institute{{/if}}
{{#if institutionAddress}}- Address: {{institutionAddress}}{{/if}}
- Class/Level: {{classLevel}}
- Subject: {{subject}}{{#if subjectCode}} (Code: {{subjectCode}}){{/if}}
- Exam Type: {{examType}}
- Total Marks: {{totalMarks}}
- Pass Marks: {{passMarks}}
- Time Limit: {{timeLimit}}

General Instructions for Students (to be included in the paper):
{{{instructions}}}

You need to generate questions for the following sections based on the counts provided.
The sum of marks for all generated questions should ideally align with the 'Total Marks'.
Ensure questions cover the syllabus for the given subject and class level proportionally and include a balance of easy, medium, and hard difficulty levels.
For each question you generate, YOU MUST clearly indicate the marks allocated within the question string itself, for example: "What is photosynthesis? (2 marks)" or "Define force. (3 marks)".
For True/False questions, include "(True/False)" in the question string, like "The sun is a planet. (True/False) (1 mark)".

Generate the following number of questions:
- Multiple Choice Questions: {{mcqCount}}
- Very Short Answer Questions: {{veryShortQuestionCount}} (Answers should be 1-2 sentences)
- Fill in the Blanks Questions: {{fillInTheBlanksCount}}
- True/False Questions: {{trueFalseCount}}
- Short Answer Questions: {{shortQuestionCount}}
- Long Answer Questions: {{longQuestionCount}}
- Numerical/Practical Questions: {{numericalPracticalCount}} (Generate these only if applicable to the subject. If not applicable, or if the count is 0, omit this section from the output.)

The user might provide a logoDataUri for the institution's logo. You do not need to do anything with this logoDataUri; it is handled by the frontend for display.

The output must be a JSON object strictly adhering to the 'GenerateQuestionsOutputSchema'.
Each array in the JSON should contain the question strings as described.
Only include arrays for 'veryShortQuestions', 'fillInTheBlanks', 'trueFalseQuestions', and 'numericalPracticalQuestions' in the output JSON if their respective counts (veryShortQuestionCount, fillInTheBlanksCount, trueFalseCount, numericalPracticalCount) are greater than 0. The 'mcqs', 'shortQuestions', and 'longQuestions' arrays should always be present, even if empty (if their count is 0).
Present questions with standard academic formatting. Start questions with a number if appropriate within their section (e.g., "1. Question text...").
  `,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionsPrompt(input);
    const result = output!;
    if (input.veryShortQuestionCount > 0 && !result.veryShortQuestions) {
      result.veryShortQuestions = [];
    }
    if (input.fillInTheBlanksCount > 0 && !result.fillInTheBlanks) {
      result.fillInTheBlanks = [];
    }
    if (input.trueFalseCount > 0 && !result.trueFalseQuestions) {
      result.trueFalseQuestions = [];
    }
    if (input.numericalPracticalCount > 0 && !result.numericalPracticalQuestions) {
      result.numericalPracticalQuestions = [];
    }
    return result;
  }
);

