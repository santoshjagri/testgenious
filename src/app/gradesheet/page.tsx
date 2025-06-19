
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Removed: import { AuthGuard } from "@/components/auth/AuthGuard";
import { GraduationCap } from "lucide-react";

export default function GradesheetPage() {
  return (
    // Removed AuthGuard wrapper
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <GraduationCap className="mr-3 h-8 w-8 text-primary" />
        <h1 className="font-semibold text-2xl md:text-3xl">Gradesheet Management</h1>
      </div>
      <Card className="mt-4 shadow-md">
        <CardHeader>
          <CardTitle>Gradesheet Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-accent/30 bg-accent/10 text-accent-foreground">
            <GraduationCap className="h-5 w-5" />
            <AlertTitle>Coming Soon!</AlertTitle>
            <AlertDescription>
              This section will allow you to manage and generate gradesheets. Stay tuned for updates!
            </AlertDescription>
          </Alert>
          <p className="mt-4 text-muted-foreground">
            Future functionality will include:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li>Inputting student scores for generated papers.</li>
            <li>Calculating grades and percentages.</li>
            <li>Generating printable gradesheets.</li>
            <li>Viewing performance analytics.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
