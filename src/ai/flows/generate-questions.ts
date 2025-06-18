'use server';

/**
 * @fileOverview Generates a diverse set of questions (MCQs, short, long) based on the specified subject and class level.
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
  mcqCount: z.number().default(5).describe('Number of Multiple Choice Questions to generate.'),
  shortQuestionCount: z.number().default(3).describe('Number of Short Questions to generate.'),
  longQuestionCount: z.number().default(2).describe('Number of Long Questions to generate.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const GenerateQuestionsOutputSchema = z.object({
  mcqs: z.array(z.string()).describe('An array of multiple-choice questions.'),
  shortQuestions: z.array(z.string()).describe('An array of short questions.'),
  longQuestions: z.array(z.string()).describe('An array of long questions.'),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an experienced teacher creating a question paper for {{classLevel}} in {{subject}}.

  Total Marks: {{totalMarks}}
  Pass Marks: {{passMarks}}
  Time Limit: {{timeLimit}}

  Instructions: {{instructions}}

  Generate {{mcqCount}} multiple-choice questions, {{shortQuestionCount}} short questions, and {{longQuestionCount}} long questions relevant to the subject and class level.

  Ensure the questions are diverse and cover a range of topics within the subject.

  The question paper sections are defined as follows:
  - mcqs: An array of multiple-choice questions.
  - shortQuestions: An array of short questions.
  - longQuestions: An array of long questions.

  Output the questions in JSON format.
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
    return output!;
  }
);
