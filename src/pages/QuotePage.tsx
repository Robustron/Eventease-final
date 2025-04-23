import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

// --- Firebase Imports ---
import { db } from "@/firebaseConfig";
import { doc, onSnapshot, Timestamp, updateDoc, serverTimestamp } from "firebase/firestore";

// --- Data Types (align with Firestore structure/functions) ---
interface Quote {
  organizerId: string;
  organizerName: string;
  amount: number;
  currency: string; // e.g., "GBP", "USD"
  message: string;
  submittedAt: Timestamp; // Use Firestore Timestamp
}

interface Inquiry {
  id: string; // Document ID will be set from Firestore
  eventType: string;
  eventDate: Timestamp; // Use Firestore Timestamp
  location: string;
  description: string;
  clientId: string;
  status: "new" | "quoted" | "accepted" | "declined" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  quote?: Quote | null;
  organizerId?: string | null;
}

// --- Helper function to format date from Timestamp ---
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return "N/A";
  return timestamp.toDate().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// --- Helper function to format time from Timestamp ---
const formatTime = (timestamp: Timestamp | undefined): string => {
   if (!timestamp) return "N/A";
  return timestamp.toDate().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// --- Helper to format currency ---
const formatCurrency = (amount: number | undefined, currency: string | undefined): string => {
    if (amount === undefined || currency === undefined) return "N/A";
    // Basic example, consider using Intl.NumberFormat for better localization
    // Example: return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
    // Simple prefixing for now:
    const symbols: { [key: string]: string } = { GBP: '£', USD: '$', EUR: '€' };
    return `${symbols[currency] || currency}${amount.toFixed(2)}`;
}

const QuotePage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  
  useEffect(() => {
    if (!eventId) {
      setError("No event ID provided.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const inquiryRef = doc(db, "inquiries", eventId);
    const unsubscribe = onSnapshot(
      inquiryRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Inquiry, 'id'>;
          setInquiry({ ...data, id: docSnap.id });
          setError(null);
        } else {
          setError("Event not found.");
          setInquiry(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching inquiry:", err);
        setError("Failed to load event details. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();

  }, [eventId]);
  
  const handleAcceptQuote = async () => {
    if (!inquiry || !eventId) return;

    setIsAccepting(true);
    const inquiryRef = doc(db, "inquiries", eventId);

    try {
      await updateDoc(inquiryRef, {
        status: "accepted",
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Quote Accepted",
        description: "The organizer has been notified and will contact you soon.",
      });

    } catch (error: any) {
       console.error("Error accepting quote:", error);
       let description = "Failed to accept the quote. Please try again.";
       if (error.code === 'permission-denied') {
           description = "You do not have permission to accept this quote.";
       }
       toast({
        title: "Error Accepting Quote",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleDeclineQuote = async () => {
    if (!inquiry || !eventId) return;

    setIsDeclining(true);
    const inquiryRef = doc(db, "inquiries", eventId);

    try {
       await updateDoc(inquiryRef, {
         status: "declined",
         updatedAt: serverTimestamp()
       });

       toast({
         title: "Quote Declined",
         description: "The organizer has been notified.",
       });

    } catch (error: any) {
       console.error("Error declining quote:", error);
       let description = "Failed to decline the quote. Please try again.";
       if (error.code === 'permission-denied') {
            description = "You do not have permission to decline this quote.";
       }
       toast({
        title: "Error Declining Quote",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsDeclining(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-eventease-500 mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/" className="btn-primary inline-block">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!inquiry) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">
              The event details could not be loaded or the event does not exist.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const quote = inquiry.quote;

  return (
    <>
      <Navbar />
      
      <motion.div
        className="min-h-screen pt-24 pb-16 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-eventease-600 text-white p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Event Inquiry Details</h1>
                <p className="opacity-90">Review the details and the quote provided by the organizer.</p>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Your Inquiry</h2>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Event Type</p>
                      <p className="text-gray-800 font-medium text-lg">{inquiry.eventType}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Event Date</p>
                        <p className="text-gray-800 flex items-center"><Calendar className="mr-2 h-4 w-4 text-gray-500" />{formatDate(inquiry.eventDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Location</p>
                        <p className="text-gray-800 flex items-center"><MapPin className="mr-2 h-4 w-4 text-gray-500" />{inquiry.location || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Description</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{inquiry.description}</p>
                    </div>
                </div>

                <div className="space-y-6 md:border-l md:pl-8">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Status & Quote</h2>
                    <div className="flex items-center">
                       <span className="text-sm font-medium mr-2">Status:</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          inquiry.status === 'new' && "bg-blue-100 text-blue-800",
                          inquiry.status === 'quoted' && "bg-yellow-100 text-yellow-800",
                          inquiry.status === 'accepted' && "bg-green-100 text-green-800",
                          inquiry.status === 'declined' && "bg-red-100 text-red-800",
                          inquiry.status === 'cancelled' && "bg-gray-100 text-gray-800"
                        )}>
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                    </div>

                    {inquiry.status === 'quoted' && quote && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-3">Quote from {quote.organizerName || 'Organizer'}</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Amount</p>
                                    <p className="text-xl font-bold text-eventease-700">{formatCurrency(quote.amount, quote.currency)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Message</p>
                                    <p className="text-gray-700 text-sm italic">"{quote.message}"</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Submitted</p>
                                    <p className="text-gray-600 text-sm">{formatDate(quote.submittedAt)} at {formatTime(quote.submittedAt)}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Button onClick={handleAcceptQuote} disabled={isAccepting || isDeclining} className="flex-1 btn-success">
                                    {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Accept Quote
                                </Button>
                                <Button onClick={handleDeclineQuote} disabled={isAccepting || isDeclining} variant="outline" className="flex-1 btn-danger-outline">
                                    {isDeclining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />} Decline Quote
                                </Button>
                            </div>
                        </div>
                    )}

                     {inquiry.status === 'accepted' && quote && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold mb-3 text-green-800">Quote Accepted!</h3>
                            <p className="text-sm text-green-700 mb-4">You accepted this quote on {formatDate(inquiry.updatedAt)}. The organizer should contact you shortly.</p>
                             <div>
                                <p className="text-xs text-green-600 uppercase font-medium tracking-wider mb-1">Accepted Quote</p>
                                <p className="text-lg font-bold text-green-800">{formatCurrency(quote.amount, quote.currency)}</p>
                            </div>
                       </div>
                    )}

                     {inquiry.status === 'declined' && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h3 className="text-lg font-semibold mb-3 text-red-800">Quote Declined</h3>
                            <p className="text-sm text-red-700">You declined this quote on {formatDate(inquiry.updatedAt)}.</p>
                       </div>
                    )}
                     
                     {inquiry.status === 'new' && (
                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                             <h3 className="text-lg font-semibold mb-3 text-blue-800">Inquiry Submitted</h3>
                             <p className="text-sm text-blue-700">Your inquiry has been submitted. Organizers are reviewing your request and will send quotes soon.</p>
                             <p className="text-xs text-gray-500 mt-2">Submitted on: {formatDate(inquiry.createdAt)}</p>
                        </div>
                     )}

                </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </>
  );
};

export default QuotePage;
