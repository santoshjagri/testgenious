
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Shield, Trash2, DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle } from "@/components/ui/alert";

const PAPER_HISTORY_KEY = "questionPaperHistory";
const GRADESHEET_HISTORY_KEY = "gradesheetHistory";
const ID_CARD_HISTORY_KEY = "idCardHistory";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleClearHistory = (key: string, name: string) => {
    try {
      localStorage.removeItem(key);
      toast({
        title: "History Cleared",
        description: `${name} has been successfully cleared from your browser's storage.`,
      });
    } catch (error) {
      console.error(`Failed to clear ${name}:`, error);
      toast({
        title: "Error",
        description: `Could not clear the ${name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and data.
          </p>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseZap className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Permanently delete your saved history from this browser. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground">
                  <DatabaseZap className="h-4 w-4" />
                  <AlertTitle>No Database is Used</AlertTitle>
                  <p className="text-xs [&_p]:leading-relaxed">All of your data is stored securely in your browser's local storage. It never leaves your device.</p>
               </Alert>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="font-medium">Paper History</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Clear Paper History?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all saved question papers.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleClearHistory(PAPER_HISTORY_KEY, 'Paper History')}>Confirm</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
               <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="font-medium">Gradesheet History</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Clear Gradesheet History?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all saved gradesheets.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleClearHistory(GRADESHEET_HISTORY_KEY, 'Gradesheet History')}>Confirm</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="font-medium">ID Card History</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Clear ID Card History?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all saved ID cards.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleClearHistory(ID_CARD_HISTORY_KEY, 'ID Card History')}>Confirm</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Clearing history removes data only from the browser you are currently using.</p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Account Model
              </CardTitle>
              <CardDescription>
                This application operates without user accounts for maximum privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You do not need to create an account or log in. All of your generated papers, gradesheets, and ID cards are stored directly and securely on your own device in your browser's local storage—not on our servers. This design means there is no central database to breach. The "Data Management" section above gives you full control to erase this local data at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
