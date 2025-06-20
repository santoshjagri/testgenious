
import type { GradeSheetFormValues, GradeSheetCalculationOutput } from './types';

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

export function calculateGradeSheet(formData: GradeSheetFormValues): GradeSheetCalculationOutput {
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

  let calculatedGrade = 'N/A';
  let calculatedGpa = 0.0;

  // Grade and GPA are determined by overall percentage
  for (const rule of GRADING_SCALE) {
    if (percentage >= rule.minPercentage) {
      calculatedGrade = rule.grade;
      calculatedGpa = rule.gpa;
      break;
    }
  }
  
  // Determine overall result status
  const overallPercentagePass = percentage >= OVERALL_PASS_PERCENTAGE_THRESHOLD;
  const resultStatus = allSubjectsPassed && overallPercentagePass ? "Pass" : "Fail";
  
  // Remarks
  let remarks = "";
  if (resultStatus === "Pass") {
    if (percentage >= 90) remarks = "Excellent performance! Keep it up.";
    else if (percentage >= 80) remarks = "Very good! Consistent effort pays off.";
    else if (percentage >= 70) remarks = "Good effort. Room for improvement.";
    else if (percentage >= 60) remarks = "Satisfactory. Focus on weaker areas.";
    else remarks = "Passed. Work harder for better results.";
  } else { 
    let failReasons = [];
    if (!allSubjectsPassed) {
        failReasons.push("one or more subjects not passed");
    }
    if (!overallPercentagePass && allSubjectsPassed) { // Only add this if they passed subjects but not overall %
        failReasons.push(`overall percentage (${percentage.toFixed(2)}%) is below the pass threshold of ${OVERALL_PASS_PERCENTAGE_THRESHOLD}%`);
    }
    
    if (failReasons.length > 0) {
      remarks = `Needs significant improvement. Reason(s): ${failReasons.join('; ')}.`;
    } else if (!allSubjectsPassed) { // Fallback if reasons array somehow remains empty
       remarks = "Needs significant improvement. Failed in one or more subjects."
    } else if (!overallPercentagePass) {
       remarks = "Needs significant improvement. Overall percentage is below pass threshold."
    } else {
       remarks = "Needs improvement to pass." // Generic fallback
    }
  }


  return {
    totalObtainedMarks,
    totalFullMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    grade: calculatedGrade, 
    gpa: parseFloat(calculatedGpa.toFixed(1)), 
    resultStatus,
    individualSubjectStatus,
    remarks,
  };
}
