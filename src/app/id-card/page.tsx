
"use client";

import * as React from 'react';
import { IDCardForm } from "@/components/id-card/IDCardForm";
import { IDCardDisplay } from "@/components/id-card/IDCardDisplay";
import type { IDCardFormValues, StoredIDCardData, StoredIDCard, IDCardTemplate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSquare2, Download, Printer as PrinterIcon, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { compressImageAndToDataUri } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IDCardTemplateArray } from '@/lib/types';

const ID_CARD_LOCAL_STORAGE_KEY = "idCardHistory";

export default function IDCardPage() {
  const [generatedCard, setGeneratedCard] = React.useState<StoredIDCardData | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();
  const [template, setTemplate] = React.useState<IDCardTemplate>('Classic');

  const handleFormSubmit = async (values: IDCardFormValues) => {
    setIsProcessing(true);
    setError(null);
    setGeneratedCard(null);

    try {
      const { logo, photo, ...otherFormValues } = values;
      
      const photoDataUri = await compressImageAndToDataUri(photo, 0.8, 400);
      const logoDataUri = logo ? await compressImageAndToDataUri(logo, 0.8, 100) : undefined;
      
      const cardData: StoredIDCardData = {
        ...otherFormValues,
        template: template,
        photoDataUri,
        logoDataUri,
      };

      setGeneratedCard(cardData);
      toast({ title: "ID Card Generated!", description: "Your ID Card is ready and saved to ID History." });

      if (typeof window !== 'undefined') {
        try {
          const newHistoryEntry: StoredIDCard = {
            id: crypto.randomUUID(),
            dateGenerated: new Date().toISOString(),
            cardData: cardData,
          };
          const existingHistoryString = localStorage.getItem(ID_CARD_LOCAL_STORAGE_KEY);
          let existingHistory: StoredIDCard[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          
          existingHistory = [newHistoryEntry, ...existingHistory];
          localStorage.setItem(ID_CARD_LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 50)));

        } catch (storageError) {
          console.error("Error saving ID card to local storage:", storageError);
          if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
             toast({ title: "Storage Full", description: "Could not save to history. Browser storage is full. Please clear some history.", variant: "destructive" });
          } else {
             toast({ title: "Warning", description: "ID Card generated, but failed to save to history.", variant: "destructive" });
          }
        }
      }
      
    } catch (e) {
      console.error("Error processing ID card:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`An unexpected error occurred: ${errorMessage}`);
      toast({ title: "Error Processing ID Card", description: errorMessage, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (generatedCard) {
      window.print();
    } else {
      toast({ title: "No Card Available", description: "Please generate an ID card before printing.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedCard) {
      toast({ title: "No Card Available", description: "Please generate an ID card before downloading.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    // Capture the inner 'id-card-base' element which is the actual, unscaled card content.
    const cardElement = document.querySelector<HTMLElement>('#id-card-display-area .id-card-base');

    if (cardElement) {
      try {
        const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        
        let pdf;
        // Standard ID Card size: 85.6mm x 53.98mm
        if (generatedCard.template === 'Elegant') { // Portrait
            pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: [53.98, 85.6]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
        } else { // Landscape
            pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: [85.6, 53.98]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
        }

        const safeName = generatedCard.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`id_card_${safeName}.pdf`);

      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: "PDF Generation Failed", variant: "destructive" });
      }
    }
    setIsDownloading(false);
  };
  
  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-primary flex items-center gap-3">
                <UserSquare2 className="h-8 w-8" />
                ID Card Studio
              </CardTitle>
              <CardDescription>
                Create professional ID cards. Select a template, fill the details, and customize the colors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={template} onValueChange={(value) => setTemplate(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  {IDCardTemplateArray.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
                </TabsList>
                <div className="mt-6">
                    <IDCardForm
                        key={template}
                        onSubmit={handleFormSubmit}
                        isLoading={isProcessing}
                        template={template}
                    />
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
           <Card>
             <CardHeader>
                <CardTitle>ID Card Preview</CardTitle>
                <CardDescription>Your generated ID card will appear here. Review it before printing or downloading.</CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center min-h-[400px] bg-muted/50 rounded-lg p-4">
                {isProcessing && (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="font-medium">Generating Card...</p>
                  </div>
                )}
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                {!isProcessing && generatedCard && (
                  <div className="w-full animate-fadeInUp space-y-4 text-center">
                     <div 
                        id="id-card-display-area"
                        className="inline-block" 
                        style={{
                          '--id-bg-color': generatedCard.backgroundColor, 
                          '--id-header-color': generatedCard.headerColor, 
                          '--id-font-color': generatedCard.fontColor
                        } as React.CSSProperties}>
                        <IDCardDisplay data={generatedCard} />
                     </div>
                      <div className="flex justify-center gap-2 no-print">
                         <Button onClick={handlePrint} variant="outline"><PrinterIcon className="mr-2 h-4 w-4" /> Print</Button>
                         <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download PDF
                         </Button>
                      </div>
                  </div>
                )}
                 {!isProcessing && !generatedCard && !error && (
                    <div className="text-center text-muted-foreground">
                        <UserSquare2 className="h-16 w-16 mx-auto mb-2" />
                        <p>Fill the form to generate a preview.</p>
                    </div>
                 )}
             </CardContent>
           </Card>
        </div>

      </div>
       <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </main>
  );
}
