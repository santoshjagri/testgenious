
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ClipboardSignature, Trash2, Eye, ArrowLeft, Download, Printer as PrinterIcon, User, CalendarDays, School, Loader2, Search, PlusCircle } from "lucide-react";
import type { StoredIDCard } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { IDCardDisplay } from '@/components/id-card/IDCardDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_KEY = "idCardHistory";

export default function IDCardHistoryPage() {
  const [historyItems, setHistoryItems] = useState<StoredIDCard[]>([]);
  const [selectedCardForView, setSelectedCardForView] = useState<StoredIDCard | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load ID card history from local storage:", error);
        toast({
          title: "Error Loading History",
          description: "Could not load ID card history from your browser's storage.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const filteredHistoryItems = historyItems.filter(item =>
    item.cardData.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHistoryItems([]);
          setSelectedCardForView(null); 
          toast({
            title: "ID History Cleared",
            description: "All ID card history has been cleared.",
          });
        } catch (error) {
          console.error("Failed to clear ID card history from local storage:", error);
          toast({
            title: "Error Clearing History",
            description: "Could not clear ID card history.",
            variant: "destructive",
          });
        }
    }
  };

  const deleteSingleItem = (cardId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const updatedHistory = historyItems.filter(item => item.id !== cardId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);
        if (selectedCardForView?.id === cardId) {
          setSelectedCardForView(null); 
        }
        toast({
          title: "ID Card Deleted",
          description: "The selected ID card has been removed from history.",
        });
      } catch (error) {
        console.error("Failed to delete item from local storage:", error);
        toast({
          title: "Error Deleting Card",
          description: "Could not delete the selected ID card.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleViewCard = (item: StoredIDCard) => {
    setSelectedCardForView(item);
  };

  const handlePrint = () => {
    if (selectedCardForView) {
      window.print();
    } else {
      toast({
        title: "No Card Selected",
        description: "Please view a card before trying to print.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedCardForView) {
        toast({ title: "No Card Selected", description: "Please view a card before trying to download.", variant: "destructive" });
        return;
    }

    setIsDownloadingPdf(true);
    const cardElement = document.getElementById('id-card-display-area-history');

    if (cardElement) {
      try {
        const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        
        let pdf;
        if (selectedCardForView.cardData.template === 'Elegant') {
             pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: [53.98, 85.6]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
        } else {
            pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: [85.6, 53.98]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
        }

        const safeName = selectedCardForView.cardData.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`id_card_${safeName}.pdf`);

      } catch (error) {
        console.error("Error generating PDF from history:", error);
        toast({ title: "PDF Generation Failed", variant: "destructive" });
      }
    }
    setIsDownloadingPdf(false);
  };


  if (selectedCardForView) {
    const { cardData } = selectedCardForView;
    return (
      <div className="flex-1 flex flex-col items-center p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-lg mb-6 flex flex-col sm:flex-row flex-wrap gap-2 no-print">
            <Button variant="outline" onClick={() => setSelectedCardForView(null)} className="w-full sm:w-auto sm:mr-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to ID History
            </Button>
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
              <PrinterIcon className="mr-2 h-4 w-4" /> Print Card
            </Button>
            <Button onClick={handleDownloadPdf} variant="default" disabled={isDownloadingPdf} className="w-full sm:w-auto">
               {isDownloadingPdf ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading... </> ) : ( <> <Download className="mr-2 h-4 w-4" /> Download PDF </> )}
            </Button>
        </div>
        <div id="id-card-display-area-history" className="inline-block" style={{'--id-bg-color': cardData.backgroundColor, '--id-header-color': cardData.headerColor, '--id-font-color': cardData.fontColor} as React.CSSProperties}>
            <IDCardDisplay data={cardData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-2 sm:p-4 md:gap-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl flex items-center">
          <ClipboardSignature className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          ID Card History
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by holder name..."
                    className="pl-8 sm:w-[200px] md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => router.push('/id-card')} className="no-print w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New
            </Button>
            {historyItems.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="no-print w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all saved ID cards from your history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearHistory}>Yes, clear history</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </div>
      {historyItems.length === 0 ? (
        <Card className="mt-4 shadow-md">
          <CardContent className="pt-6">
            <Alert className="border-primary/20 bg-primary/5">
              <ClipboardSignature className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary text-base sm:text-lg">No ID Card History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80 text-xs sm:text-sm">
                You haven't generated any ID cards yet. Go to "ID Card Studio" to get started. Your generated cards will appear here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : filteredHistoryItems.length === 0 ? (
         <Card className="mt-4 shadow-md col-span-full">
            <CardContent className="pt-6">
                <Alert>
                    <Search className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary text-base sm:text-lg">No Results Found</AlertTitle>
                    <AlertDescription className="text-foreground/80 text-xs sm:text-sm">
                        No ID cards match your search for "{searchQuery}". Try a different name.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {filteredHistoryItems.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                    <User className="h-5 w-5 flex-shrink-0"/>
                    <span className="truncate">{item.cardData.fullName}</span>
                </CardTitle>
                <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    <p className="flex items-center"><School className="h-3 w-3 mr-1.5"/> <span className="truncate">{item.cardData.institutionName}</span></p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs flex-grow py-0 pb-3">
                 <p className="mt-2 text-xs text-muted-foreground pt-2 border-t flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1.5"/> 
                    Generated: {new Date(item.dateGenerated).toLocaleDateString()}
                 </p>
              </CardContent>
              <CardFooter className="border-t p-1 flex justify-around items-center">
                <Button variant="ghost" size="sm" onClick={() => handleViewCard(item)} className="text-primary hover:bg-primary/10 flex-1 text-xs h-8">
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 text-xs h-8">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete ID Card?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the ID card for "{item.cardData.fullName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSingleItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    