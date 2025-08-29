
import type { GradeSheetFormValues, GradeSheetCalculationOutput } from './types';

interface GradingRule {
  minPercentage: number;
  grade: string;
  // The gpa field in GradingRule is now illustrative, as GPA is calculated directly.
  gpa: number; 
}

// Define your grading scale here (primarily for letter grades now)
const GRADING_SCALE: GradingRule[] = [
  { minPercentage: 90, grade: 'A+', gpa: 4.0 },
  { minPercentage: 80, grade: 'A', gpa: 3.6 },
  { minPercentage: 70, grade: 'B+', gpa: 3.2 },
  { minPercentage: 60, grade: 'B', gpa: 2.8 },
  { minPercentage: 50, grade: 'C+', gpa: 2.4 },
  { minPercentage: 40, grade: 'C', gpa: 2.0 },
  { minPercentage: 0, grade: 'NG', gpa: 0.0 }, // Not Graded / Fail
];

const OVERALL_PASS_PERCENTAGE_THRESHOLD = 40; // Student needs at least 40% overall to pass

export function calculateGradeSheet(formData: GradeSheetFormValues): GradeSheetCalculationOutput {
  let totalObtainedMarks = 0;
  let totalFullMarks = 0;
  const individualSubjectStatus: Array<{ subjectName: string; status: "Pass" | "Fail" }> = [];
  let allSubjectsPassed = true;

  formData.subjects.forEach(subject => {
    const theoryMarks = subject.theoryObtainedMarks;
    const practicalMarks = subject.practicalObtainedMarks || 0;
    const subjectTotalObtained = theoryMarks + practicalMarks;
    
    const theoryFull = subject.theoryFullMarks;
    const practicalFull = subject.practicalFullMarks || 0;
    const subjectFullTotal = theoryFull + practicalFull;

    totalObtainedMarks += subjectTotalObtained;
    totalFullMarks += subjectFullTotal;

    const theoryPassed = theoryMarks >= subject.theoryPassMarks;
    // Practical is passed if not applicable (full marks is 0 or undefined), or if marks are sufficient
    const practicalPassed = !practicalFull || practicalMarks >= (subject.practicalPassMarks || 0);
    
    const subjectPassed = theoryPassed && practicalPassed;
    individualSubjectStatus.push({ subjectName: subject.subjectName, status: subjectPassed ? "Pass" : "Fail" });
    if (!subjectPassed) {
      allSubjectsPassed = false;
    }
  });

  const percentage = totalFullMarks > 0 ? (totalObtainedMarks / totalFullMarks) * 100 : 0;

  let calculatedGrade = 'N/A';
  // Calculate GPA using the formula: (Percentage / 100) * 4
  const calculatedGpa = (percentage / 100) * 4.0;

  // Determine Grade (letter grade) from the GRADING_SCALE based on percentage
  for (const rule of GRADING_SCALE) {
    if (percentage >= rule.minPercentage) {
      calculatedGrade = rule.grade;
      break;
    }
  }
  
  // Determine overall result status
  const overallPercentagePass = percentage >= OVERALL_PASS_PERCENTAGE_THRESHOLD;
  const resultStatus = allSubjectsPassed && overallPercentagePass ? "Pass" : "Fail";
  
  // If the result is fail, but the grade isn't 'NG', set it to 'NG'
  if (resultStatus === "Fail") {
      calculatedGrade = 'NG';
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
    let failReasons = [];
    if (!allSubjectsPassed) {
        failReasons.push("one or more subjects not passed");
    }
    if (!overallPercentagePass && allSubjectsPassed) { 
        failReasons.push(`overall percentage (${percentage.toFixed(2)}%) is below the pass threshold of ${OVERALL_PASS_PERCENTAGE_THRESHOLD}%`);
    } else if (!overallPercentagePass && !allSubjectsPassed) { // If both conditions for failure are met
        failReasons.push(`overall percentage (${percentage.toFixed(2)}%) is below the pass threshold of ${OVERALL_PASS_PERCENTAGE_THRESHOLD}%`);
    }
    
    if (failReasons.length > 0) {
      remarks = `Needs significant improvement. Reason(s): ${failReasons.join('; ')}.`;
    } else if (!allSubjectsPassed) { 
       remarks = "Needs significant improvement. Failed in one or more subjects."
    } else if (!overallPercentagePass) {
       remarks = "Needs significant improvement. Overall percentage is below pass threshold."
    } else {
       remarks = "Needs improvement to pass." 
    }
  }


  return {
    totalObtainedMarks,
    totalFullMarks,
    percentage: parseFloat(percentage.toFixed(2)),
    grade: calculatedGrade, 
    gpa: parseFloat(calculatedGpa.toFixed(2)), // GPA rounded to two decimal places
    resultStatus,
    individualSubjectStatus,
    remarks,
  };
}
