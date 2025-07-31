
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IDCardForm } from "@/components/id-card/IDCardForm";
import { IDCardDisplay } from "@/components/id-card/IDCardDisplay";
import type { IDCardFormValues, StoredIDCardData, StoredIDCard, IDCardTemplate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserSquare2, User, Download, Printer as PrinterIcon, Loader2, ClipboardSignature, Trash2, Eye, ArrowLeft, CalendarDays, School, Search, Edit, RotateCcw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { compressImageAndToDataUri } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IDCardTemplateArray } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const ID_CARD_LOCAL_STORAGE_KEY = "idCardHistory";

const getNewFormDefaults = (): IDCardFormValues => ({
  template: 'Classic',
  institutionName: 'Genesis International School',
  fullName: 'Alex Doe',
  classOrCourse: 'Grade 10, Section A',
  dateOfBirth: '2008-05-12',
  issueDate: format(new Date(), "yyyy-MM-dd"),
  expiryDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
  holderAddress: '123 Future Lane, Innovation City',
  headerColor: '#0c4a6e',
  backgroundColor: '#f1f5f9',
  fontColor: '#0f172a',
  photo: undefined,
  logo: undefined,
});


export default function IDCardPage() {
  // Creator states
  const [generatedCard, setGeneratedCard] = React.useState<StoredIDCardData | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();
  const [template, setTemplate] = React.useState<IDCardTemplate>('Classic');
  const [initialFormValues, setInitialFormValues] = React.useState<IDCardFormValues | undefined>(undefined);
  const [editingCardId, setEditingCardId] = React.useState<string | null>(null);
  
  // History states
  const [historyItems, setHistoryItems] = React.useState<StoredIDCard[]>([]);
  const [selectedCardForView, setSelectedCardForView] = React.useState<StoredIDCard | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Combined state
  const [activeTab, setActiveTab] = React.useState('creator');
  const router = useRouter();

  React.useEffect(() => {
    // This effect runs on mount to ensure the form has default values
    // for creating a new card, but only if not in editing mode.
    if (!editingCardId) {
        setInitialFormValues(getNewFormDefaults());
    }
  }, [editingCardId]);

  React.useEffect(() => {
    if (activeTab === 'history' && typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(ID_CARD_LOCAL_STORAGE_KEY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load ID card history:", error);
        toast({
          title: "Error Loading History",
          description: "Could not load history from your browser's storage.",
          variant: "destructive",
        });
      }
    }
  }, [activeTab, toast]);

  const filteredHistoryItems = historyItems.filter(item =>
    item.cardData.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSubmit = async (values: IDCardFormValues) => {
    setIsProcessing(true);
    setError(null);
    if (!editingCardId) {
      setGeneratedCard(null);
    }

    try {
      const { logo, photo, ...otherFormValues } = values;
      
      let photoDataUri: string;
      if (photo) {
        photoDataUri = await compressImageAndToDataUri(photo, 0.8, 400);
      } else if (editingCardId && generatedCard?.photoDataUri) {
        photoDataUri = generatedCard.photoDataUri;
      } else {
        toast({ title: "Photo Required", description: "Please upload a photo for the ID card.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      
      let logoDataUri: string | undefined;
      if (logo) {
        logoDataUri = await compressImageAndToDataUri(logo, 0.8, 100);
      } else if (editingCardId && generatedCard?.logoDataUri) {
        logoDataUri = generatedCard.logoDataUri;
      }
      
      const cardData: StoredIDCardData = {
        ...otherFormValues,
        template: template,
        photoDataUri,
        logoDataUri,
      };

      setGeneratedCard(cardData);

      if (typeof window !== 'undefined') {
        try {
          const existingHistoryString = localStorage.getItem(ID_CARD_LOCAL_STORAGE_KEY);
          let existingHistory: StoredIDCard[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          
          if (editingCardId) {
            existingHistory = existingHistory.map(item =>
              item.id === editingCardId 
                ? { ...item, cardData: cardData, dateGenerated: new Date().toISOString() } 
                : item
            );
            toast({ title: "ID Card Updated!", description: "The ID Card has been updated and saved to ID History." });
          } else {
            const newHistoryEntry: StoredIDCard = {
              id: crypto.randomUUID(),
              dateGenerated: new Date().toISOString(),
              cardData: cardData,
            };
            existingHistory = [newHistoryEntry, ...existingHistory];
            toast({ title: "ID Card Generated!", description: "Your ID Card is ready and saved to ID History." });
          }

          localStorage.setItem(ID_CARD_LOCAL_STORAGE_KEY, JSON.stringify(existingHistory.slice(0, 50)));
          setHistoryItems(existingHistory.slice(0, 50));
          if (editingCardId) {
            setEditingCardId(null);
          }

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
    if (generatedCard || selectedCardForView) {
      window.print();
    } else {
      toast({ title: "No Card Available", description: "Please generate or select a card before printing.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    const cardToDownload = generatedCard || selectedCardForView?.cardData;
    if (!cardToDownload) {
      toast({ title: "No Card Available", description: "Please generate or select a card before downloading.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    const elementSelector = selectedCardForView ? '#id-card-display-area-history .id-card-base' : '#id-card-display-area .id-card-base';
    const cardElement = document.querySelector<HTMLElement>(elementSelector);

    if (cardElement) {
      try {
        const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, backgroundColor: null, scrollX: -window.scrollX, scrollY: -window.scrollY, windowWidth: cardElement.scrollWidth, windowHeight: cardElement.scrollHeight });
        const imgData = canvas.toDataURL('image/png');
        
        let pdf;
        if (cardToDownload.template === 'Elegant') { // Portrait
            pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [53.98, 85.6] });
            pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
        } else { // Landscape
            pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
        }

        const safeName = cardToDownload.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`id_card_${safeName}.pdf`);

      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: "PDF Generation Failed", variant: "destructive" });
      }
    }
    setIsDownloading(false);
  };
  
  // History functions
  const clearHistory = () => {
    if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(ID_CARD_LOCAL_STORAGE_KEY);
          setHistoryItems([]);
          setSelectedCardForView(null); 
          toast({ title: "ID History Cleared", description: "All ID card history has been cleared." });
        } catch (error) {
          console.error("Failed to clear ID card history:", error);
          toast({ title: "Error Clearing History", variant: "destructive" });
        }
    }
  };

  const deleteSingleItem = (cardId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const updatedHistory = historyItems.filter(item => item.id !== cardId);
        localStorage.setItem(ID_CARD_LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);
        if (selectedCardForView?.id === cardId) {
          setSelectedCardForView(null); 
        }
        toast({ title: "ID Card Deleted", description: "The selected ID card has been removed from history." });
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast({ title: "Error Deleting Card", variant: "destructive" });
      }
    }
  };
  
  const handleViewCard = (item: StoredIDCard) => {
    setSelectedCardForView(item);
  };

  const handleEditCard = (cardId: string) => {
    const cardToEdit = historyItems.find((item) => item.id === cardId);
    if (cardToEdit) {
      const formValues: IDCardFormValues = {
        ...cardToEdit.cardData,
        photo: undefined,
        logo: undefined,
      };
      setInitialFormValues(formValues);
      setGeneratedCard(cardToEdit.cardData);
      setEditingCardId(cardToEdit.id);
      setTemplate(cardToEdit.cardData.template);
      setActiveTab('creator');
      toast({
        title: "Editing ID Card",
        description: `Loaded card for "${cardToEdit.cardData.fullName}" for editing.`,
      });
      window.scrollTo(0, 0);
    }
  };
  
  const clearFormAndStartNew = () => {
    setInitialFormValues(getNewFormDefaults());
    setGeneratedCard(null);
    setEditingCardId(null);
    setTemplate('Classic');
    toast({ title: "Form Cleared", description: "Ready for a new ID card."});
  };

  if (!initialFormValues) {
    return (
        <div className="flex-1 flex justify-center items-center p-6">
            <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Loading ID Card Studio...</p>
            </div>
        </div>
    );
  }

  if (selectedCardForView) {
    const { cardData } = selectedCardForView;
    return (
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
        <div className="w-full max-w-lg mb-6 flex flex-col sm:flex-row flex-wrap gap-2 no-print">
            <Button variant="outline" onClick={() => setSelectedCardForView(null)} className="w-full sm:w-auto sm:mr-auto"><ArrowLeft className="mr-2 h-4 w-4" /> Back to ID History</Button>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto"><PrinterIcon className="mr-2 h-4 w-4" /> Print Card</Button>
            <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloading} className="w-full sm:w-auto">
               {isDownloading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading... </> ) : ( <> <Download className="mr-2 h-4 w-4" /> Download PDF </> )}
            </Button>
        </div>
        <div id="id-card-display-area-history" className="inline-block" style={{'--id-bg-color': cardData.backgroundColor, '--id-header-color': cardData.headerColor, '--id-font-color': cardData.fontColor} as React.CSSProperties}>
            <IDCardDisplay data={cardData} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-blue-50/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-grow">
                <UserSquare2 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline text-primary">ID Card Studio</h1>
            </div>
            <TabsList className="grid w-full sm:w-auto sm:grid-cols-2">
                <TabsTrigger value="creator">Create New</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="creator">
           {editingCardId && (
              <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground no-print mb-4">
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                  <AlertTitle className="text-base sm:text-lg">Editing Mode</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                  You are currently editing a saved ID Card. Make your changes and click the button below to update it.
                  <Button variant="outline" size="sm" onClick={clearFormAndStartNew} className="ml-2 sm:ml-4 mt-1 sm:mt-0 text-xs">
                      <RotateCcw className="mr-1 h-3 w-3" /> Create New Instead
                  </Button>
                  </AlertDescription>
              </Alert>
          )}
          <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Design your ID Card</CardTitle>
                  <CardDescription>Select a template, fill the details, and customize the colors.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={template} onValueChange={(value) => setTemplate(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                      {IDCardTemplateArray.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
                    </TabsList>
                    <div className="mt-6">
                      <IDCardForm 
                        key={editingCardId || template} 
                        onSubmit={handleFormSubmit} 
                        isLoading={isProcessing} 
                        template={template}
                        initialValues={initialFormValues}
                      />
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            <div>
               <Card>
                 <CardHeader><CardTitle>ID Card Preview</CardTitle><CardDescription>Your generated ID card will appear here.</CardDescription></CardHeader>
                 <CardContent className="flex flex-col items-center justify-center min-h-[400px] bg-muted/50 rounded-lg p-4">
                    {isProcessing && (<div className="flex flex-col items-center gap-2 text-primary"><Loader2 className="h-10 w-10 animate-spin" /><p className="font-medium">Generating Card...</p></div>)}
                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {!isProcessing && generatedCard && (
                      <div className="w-full animate-fadeInUp space-y-4 text-center">
                         <div id="id-card-display-area" className="inline-block" style={{'--id-bg-color': generatedCard.backgroundColor, '--id-header-color': generatedCard.headerColor, '--id-font-color': generatedCard.fontColor} as React.CSSProperties}>
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
                     {!isProcessing && !generatedCard && !error && (<div className="text-center text-muted-foreground"><UserSquare2 className="h-16 w-16 mx-auto mb-2" /><p>Fill the form to generate a preview.</p></div>)}
                 </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search by holder name..." className="pl-8 sm:w-[200px] md:w-[250px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {historyItems.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="no-print w-full sm:w-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear All History</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all saved ID cards.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearHistory}>Yes, clear history</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {historyItems.length === 0 ? (
            <Card className="mt-4 shadow-md"><CardContent className="pt-6"><Alert className="border-primary/20 bg-primary/5"><ClipboardSignature className="h-5 w-5 text-primary" /><AlertTitle className="text-primary text-base sm:text-lg">No ID Card History Yet</AlertTitle><AlertDescription className="text-foreground/80 text-xs sm:text-sm">Your generated cards will appear here.</AlertDescription></Alert></CardContent></Card>
          ) : filteredHistoryItems.length === 0 ? (
             <Card className="mt-4 shadow-md col-span-full"><CardContent className="pt-6"><Alert><Search className="h-5 w-5 text-primary" /><AlertTitle className="text-primary text-base sm:text-lg">No Results Found</AlertTitle><AlertDescription className="text-foreground/80 text-xs sm:text-sm">No ID cards match your search for "{searchQuery}".</AlertDescription></Alert></CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {filteredHistoryItems.map((item) => (
                <Card key={item.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
                  <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-primary flex items-center gap-2"><User className="h-5 w-5 flex-shrink-0"/><span className="truncate">{item.cardData.fullName}</span></CardTitle><div className="text-xs text-muted-foreground space-y-0.5 pt-1"><p className="flex items-center"><School className="h-3 w-3 mr-1.5"/> <span className="truncate">{item.cardData.institutionName}</span></p></div></CardHeader>
                  <CardContent className="space-y-2 text-xs flex-grow py-0 pb-3"><p className="mt-2 text-xs text-muted-foreground pt-2 border-t flex items-center"><CalendarDays className="h-3 w-3 mr-1.5"/> Generated: {new Date(item.dateGenerated).toLocaleDateString()}</p></CardContent>
                  <CardFooter className="border-t p-1 flex justify-around items-center">
                    <Button variant="ghost" size="sm" onClick={() => handleViewCard(item)} className="text-primary hover:bg-primary/10 flex-1 text-xs h-8"><Eye className="mr-1 h-3 w-3" /> View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCard(item.id)} className="text-foreground hover:bg-secondary flex-1 text-xs h-8"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-xs h-8"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete ID Card?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete the ID card for "{item.cardData.fullName}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSingleItem(item.id)} className="bg-destructive hover:bg-destructive/90">Yes, Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
       <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </main>
  );
}
