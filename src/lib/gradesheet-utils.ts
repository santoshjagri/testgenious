
import type { SubjectMarkInput, CalculatedGradeSheetResult, GradeSheetFormValues } from './types';

interface GradingRule {
  minPercentage: number;
  grade: string;
  gpa: number;
}

// Define your grading scale here
const GRADING_SCALE: GradingRule[] = [
  { minPercentage: 90, grade: 'A+', gpa: 4.0 },
  { minPercentage: 80, grade: 'A', gpa: 3.6 },
  { minPercentage: 70, grade: 'B+', gpa: 3.2 },
  { minPercentage: 60, grade: 'B', gpa: 2.8 },
  { minPercentage: 50, grade: 'C+', gpa: 2.4 },
  { minPercentage: 40, grade: 'C', gpa: 2.0 },
  { minPercentage: 0, grade: 'NG', gpa: 0.0 }, // Not Graded / Fail
];

const OVERALL_PASS_PERCENTAGE_THRESHOLD = 40; // Example: Student needs at least 40% overall to pass

export function calculateGradeSheet(formData: GradeSheetFormValues): CalculatedGradeSheetResult {
  let totalObtainedMarks = 0;
  let totalFullMarks = 0;
  const individualSubjectStatus: Array<{ subjectName: string; status: "Pass" | "Fail" }> = [];
  let allSubjectsPassed = true;

  formData.subjects.forEach(subject => {
    totalObtainedMarks += subject.obtainedMarks;
    totalFullMarks += subject.fullMarks;
    const subjectPassed = subject.obtainedMarks >= subject.passMarks;
    individualSubjectStatus.push({ subjectName: subject.subjectName, status: subjectPassed ? "Pass" : "Fail" });
    if (!subjectPassed) {
      allSubjectsPassed = false;
    }
  });

  const percentage = totalFullMarks > 0 ? (totalObtainedMarks / totalFullMarks) * 100 : 0;

  let grade = 'N/A';
  let gpa = 0.0;

  for (const rule of GRADING_SCALE) {
    if (percentage >= rule.minPercentage) {
      grade = rule.grade;
      gpa = rule.gpa;
      break;
    }
  }
  
  // Determine overall result status
  // Pass if all subjects are passed AND overall percentage meets threshold
  const overallPass = allSubjectsPassed && percentage >= OVERALL_PASS_PERCENTAGE_THRESHOLD;
  const resultStatus = overallPass ? "Pass" : "Fail";

  // If any subject is failed, or overall percentage is below NG threshold, ensure grade reflects this.
  // This is a stricter fail condition. If 'NG' is only for very low scores, adjust this.
  if (!allSubjectsPassed || percentage < GRADING_SCALE[GRADING_SCALE.length -2].minPercentage) { // -2 to check against C threshold
    grade = 'NG'; // Force NG if any subject failed or overall is too low
    gpa = 0.0;
  }
  
  // Remarks
  let remarks = "";
  if (resultStatus === "Pass") {
    if (percentage >= 90) remarks = "Excellent performance! Keep it up.";
    else if (percentage >= 80) remarks = "Very good! Consistent effort pays off.";
    else if (percentage >= 70) remarks = "Good effort. Room for improvement.";
    else if (percentage >= 60) remarks = "Satisfactory. Focus on weaker areas.";
    else remarks = "Passed. Work harder for better results.";
  } else {
    remarks = "Needs significant improvement. Focus on all subjects.";
  }


  return {
    ...formData,
    totalObtainedMarks,
    totalFullMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    grade,
    gpa: parseFloat(gpa.toFixed(1)),
    resultStatus,
    individualSubjectStatus,
    remarks,
  };
}
