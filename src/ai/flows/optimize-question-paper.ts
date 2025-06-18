'use server';

/**
 * @fileOverview A question paper optimization AI agent.
 *
 * - optimizeQuestionPaper - A function that handles the question paper optimization process.
 * - OptimizeQuestionPaperInput - The input type for the optimizeQuestionPaper function.
 * - OptimizeQuestionPaperOutput - The return type for the optimizeQuestionPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeQuestionPaperInputSchema = z.object({
  questionPaper: z.string().describe('The question paper to optimize.'),
  totalMarks: z.number().describe('The total marks for the question paper.'),
  passMarks: z.number().describe('The pass marks for the question paper.'),
  timeLimit: z.string().describe('The time limit for the question paper (e.g., 1 hour 30 minutes).'),
  classLevel: z.string().describe('The class or level for which the question paper is intended.'),
  subject: z.string().describe('The subject of the question paper.'),
});
export type OptimizeQuestionPaperInput = z.infer<typeof OptimizeQuestionPaperInputSchema>;

const OptimizeQuestionPaperOutputSchema = z.object({
  optimizedQuestionPaper: z.string().describe('The optimized question paper.'),
  justification: z.string().describe('The justification for the optimizations made.'),
});
export type OptimizeQuestionPaperOutput = z.infer<typeof OptimizeQuestionPaperOutputSchema>;

export async function optimizeQuestionPaper(input: OptimizeQuestionPaperInput): Promise<OptimizeQuestionPaperOutput> {
  return optimizeQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeQuestionPaperPrompt',
  input: {schema: OptimizeQuestionPaperInputSchema},
  output: {schema: OptimizeQuestionPaperOutputSchema},
  prompt: `You are an expert teacher specializing in creating and optimizing question papers.

You will use this information to optimize the question paper, ensuring the difficulty and length are appropriate for the students, considering the total marks, pass marks, and time limit.

Class/Level: {{{classLevel}}}
Subject: {{{subject}}}
Total Marks: {{{totalMarks}}}
Pass Marks: {{{passMarks}}}
Time Limit: {{{timeLimit}}}

Original Question Paper:
{{{questionPaper}}}

Optimize the question paper and provide a justification for the changes you made. Be specific about which questions were changed and why.
`,
});

const optimizeQuestionPaperFlow = ai.defineFlow(
  {
    name: 'optimizeQuestionPaperFlow',
    inputSchema: OptimizeQuestionPaperInputSchema,
    outputSchema: OptimizeQuestionPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
