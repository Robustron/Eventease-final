import * as React from 'react';
import { useState, useEffect } from "react";
// import { motion } from "framer-motion"; // Remove unused import
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext"; // Might need this later for real data/logout
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Check,
  X,
  Send,
  MessageSquare,
  Loader2, // Ensure Loader2 is listed here
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added for QuoteForm
import { Label } from "@/components/ui/label"; // Added for QuoteForm
import { Textarea } from "@/components/ui/textarea"; // Added for QuoteForm

// --- Firebase Imports ---
import { db } from "@/firebaseConfig";
import { collection, query, onSnapshot, Timestamp, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore"; // Added Firestore functions

// --- Data Types ---
interface Quote { // Define Quote type as expected within Inquiry
  organizerId?: string; // Optional if only storing on accept
  organizerName?: string;
  amount: number;
  currency: string;
  message: string;
  submittedAt: Timestamp;
  acceptedAt?: Timestamp;
  clientName?: string; 
  clientEmail?: string;
  clientPhone?: string;
}

interface Inquiry {
  id: string; // Firestore document ID
  eventType: string;
  eventDate: Timestamp;
  location?: string; // Made optional if not always present
  distance?: number; // Maybe remove if not calculated/stored
  description: string;
  clientId?: string; // Optional now
  name?: string; // Client name from form
  email?: string; // Client email from form
  phone?: string; // Client phone from form
  expectedGuests?: number;
  status: "new" | "quoted" | "accepted" | "declined" | "cancelled";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  quote?: Quote | null;
  organizerId?: string | null; // ID of organizer who quoted/accepted
}

// --- Placeholder function to simulate sending a quote (Update needed later) ---
// Keep existing sendInquiryQuote placeholder for now
const sendInquiryQuote = async (inquiryId: string, quote: { amount: number, currency: string, message: string }): Promise<boolean> => {
  console.log("Simulating sending quote for inquiry:", inquiryId, quote);
  const inquiryRef = doc(db, "inquiries", inquiryId);
  try {
      await updateDoc(inquiryRef, {
          status: "quoted",
          quote: { // Structure according to Quote interface
             amount: quote.amount,
             currency: quote.currency,
             message: quote.message,
             submittedAt: serverTimestamp()
             // organizerId/Name would be added here from logged-in organizer context
          },
          updatedAt: serverTimestamp()
      });
       await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      return true;
  } catch (error) {
      console.error("Error updating inquiry status to quoted:", error);
      return false;
  }
};

// --- Helper function to format time remaining (Adjust logic if needed) ---
const getTimeRemaining = (createdAt: Timestamp | undefined): string => {
  if (!createdAt) return "Unknown";
  const expiryTime = new Date(createdAt.toDate().getTime() + 24 * 60 * 60 * 1000); // Still 24 hours for demo
  const now = new Date();
  const diffMs = expiryTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};

// --- Helper function to format date from Timestamp ---
const formatDate = (date: Timestamp | undefined): string => {
  if (!date) return "N/A";
  return date.toDate().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// --- Helper to format currency ---
const formatCurrency = (amount: number | undefined, currency: string | undefined): string => {
    if (amount === undefined || currency === undefined) return "N/A";
    const symbols: { [key: string]: string } = { GBP: '£', USD: '$', EUR: '€' };
    return `${symbols[currency] || currency}${amount.toFixed(2)}`;
}

// --- InquiryCard Component ---
const InquiryCard = ({ inquiry, onQuote }: { inquiry: Inquiry; onQuote: (id: string) => void }) => { // Use Inquiry type
  const timeRemaining = getTimeRemaining(inquiry.createdAt);
  const isExpired = timeRemaining === "Expired" && inquiry.status === 'new';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{inquiry.eventType}</h3>
            {/* Assuming distance is not available, maybe show location? */}
            {inquiry.location && (
               <div className="flex items-center text-sm text-gray-500 mt-1">
                 <MapPin className="h-4 w-4 mr-1" />
                 <span>{inquiry.location}</span>
               </div>
            )}
          </div>
          
          {/* Status badges - logic remains similar */}
          {inquiry.status === "new" && (
             <div className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
               <Clock className="h-3 w-3 mr-1" />
               <span>{timeRemaining}</span>
             </div>
          )}
          {inquiry.status === "quoted" && ( <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /><span>Quoted</span></div> )}
          {inquiry.status === "accepted" && ( <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /><span>Accepted</span></div> )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            {/* Use formatDate with the Timestamp */}
            <span>{formatDate(inquiry.eventDate)}</span> 
          </div>
          <p className="text-gray-700 text-sm line-clamp-3">{inquiry.description}</p>
        </div>
        
        {/* Button logic remains similar, check status */}
        {inquiry.status === "new" && (
          <Button
            onClick={() => onQuote(inquiry.id)}
            disabled={isExpired}
            className={`w-full flex items-center justify-center text-sm font-medium transition-colors ${
              isExpired 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-eventease-600 text-white hover:bg-eventease-700'
            }`}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Quote
          </Button>
        )}
        
        {/* Display quote info if status is quoted */}
        {inquiry.status === "quoted" && inquiry.quote && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Quote:</span>
              <span className="font-semibold">{formatCurrency(inquiry.quote.amount, inquiry.quote.currency)}</span>
            </div>
          </div>
        )}
        
        {/* Display client info if status is accepted */}
        {inquiry.status === "accepted" && inquiry.quote && (
           <div className="border-t border-gray-100 pt-3 mt-3">
             <div className="flex items-center justify-between text-sm mb-2">
               <span className="text-gray-600">Client:</span>
               {/* Use client name from form if available, fallback needed */} 
               <span className="font-semibold">{inquiry.name || inquiry.quote.clientName || 'N/A'}</span>
             </div>
             <div className="flex flex-col space-y-1">
               {/* Use client email/phone from form if available */} 
               {(inquiry.email || inquiry.quote.clientEmail) && (
                  <a href={`mailto:${inquiry.email || inquiry.quote.clientEmail}`} className="text-sm text-eventease-600 hover:text-eventease-700 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {inquiry.email || inquiry.quote.clientEmail}
                  </a>
               )}
                {(inquiry.phone || inquiry.quote.clientPhone) && (
                   <a href={`tel:${inquiry.phone || inquiry.quote.clientPhone}`} className="text-sm text-eventease-600 hover:text-eventease-700 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {inquiry.phone || inquiry.quote.clientPhone}
                  </a>
                )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

// --- QuoteForm Component ---
const QuoteForm = ({ 
  inquiryId, 
  onSubmit, 
  onClose 
}: { 
  inquiryId: string; 
  // Update onSubmit to reflect stored data (remove currency symbol addition maybe?)
  onSubmit: (quoteData: { amount: number, currency: string, message: string }) => Promise<void>;
  onClose: () => void;
}) => {
  const [amount, setAmount] = useState<string>(""); // Keep as string for input handling
  const [message, setMessage] = useState("");
  const [currency] = useState("GBP"); // Default or select currency
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0 || !message) { 
        alert("Please enter a valid positive amount and a message.");
        return;
    }
    setIsSubmitting(true);
    
    try {
      // Pass numeric amount and currency to parent
      await onSubmit({ amount: numericAmount, currency, message }); 
      // Let parent handle closing on success
    } catch (error) {
      console.error("Failed to submit quote:", error);
      alert("Failed to submit quote. Please try again."); 
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Quote Amount ({currency})
        </Label>
        <div className="relative mt-1 rounded-md shadow-sm">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <span className="text-gray-500 sm:text-sm">{formatCurrency(undefined, currency).charAt(0)}</span>
           </div>
          <Input
            type="number" 
            id="amount"
            className="input-field w-full pl-7 pr-12" 
            placeholder="0.00"
            value={amount} // Bind to string state
            onChange={(e) => setAmount(e.target.value)} // Update string state
            required
            min="0.01" // Ensure positive amount
            step="0.01"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message to Client
        </Label>
        <Textarea
          id="message"
          className="input-field w-full mt-1"
          rows={4}
          placeholder="Describe what's included in your quote..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      
      <div className="pt-2 flex space-x-3 justify-end">
        <Button 
          variant="outline"
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !amount || !message}
          className="bg-eventease-600 text-white hover:bg-eventease-700"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> 
          ) : (
             <><Send className="mr-2 h-4 w-4" /> Send Quote</>
          )}
        </Button>
      </div>
    </form>
  );
};

// --- OrganizerDashboard Component ---
const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  // const { currentUser, authLoading } = useAuth(); // Get user/auth state later
  const { toast } = useToast();
  
  // Remove MOCK_INQUIRIES
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  
  // Placeholder for auth check - redirect if not logged in
  // useEffect(() => {
  //   if (!authLoading && !currentUser) { // Check after loading state is resolved
  //     navigate("/organizer/login");
  //     toast({ title: "Access Denied", description: "Please log in.", variant: "destructive" });
  //   }
  // }, [currentUser, authLoading, navigate, toast]);

  // Fetch inquiries from Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Query inquiries, order by creation date (descending)
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const inquiriesData: Inquiry[] = [];
        querySnapshot.forEach((doc) => {
          // Important: Combine doc data and ID
          inquiriesData.push({ ...doc.data(), id: doc.id } as Inquiry);
        });
        setInquiries(inquiriesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching inquiries:", err);
        setError("Failed to load inquiries. Please try again later.");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means run once on mount

  const handleOpenQuoteDialog = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setIsQuoteDialogOpen(true);
  };
  
  const handleCloseQuoteDialog = () => {
    setIsQuoteDialogOpen(false);
    setSelectedInquiryId(null);
  };

  // Updated handleSubmitQuote to call placeholder (needs real logic later)
   const handleSubmitQuote = async (quoteData: { amount: number, currency: string, message: string }) => {
    if (!selectedInquiryId) return;
    
    try {
      // Call the (updated) placeholder function
      const success = await sendInquiryQuote(selectedInquiryId, quoteData);
      
      if (success) {
         // Local state update is now handled by onSnapshot, so we just show toast and close dialog
        toast({
          title: "Quote Sent",
          description: "Your quote has been successfully sent.",
          variant: "success",
        });
        handleCloseQuoteDialog(); // Close dialog on success
      } else {
          throw new Error("Quote submission failed via placeholder function.");
      }
    } catch (error) {
      console.error("Quote submission error:", error);
      toast({
        title: "Failed to Send Quote",
        description: "There was an error sending your quote. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter inquiries based on selected tab (uses live data now)
  const filteredInquiries = inquiries.filter(inquiry => {
    if (selectedTab === "all") return true;
    return inquiry.status === selectedTab;
  });

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-24 pb-16 bg-gray-50"> {/* Replace with regular div */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-7xl mx-auto"> {/* Use max-w-7xl for wider layout */} 
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your event inquiries and quotes
                </p>
              </div>
              
              {/* Service Area Card - Keep as is */}
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="bg-white shadow-sm rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500">Your service area</p>
                  <p className="font-medium text-gray-900">100 km radius</p>
                </div>
                {/* Add more cards here if needed */}
              </div>
            </div>
            
            {/* Tabs - Adjust grid cols if needed */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="quoted">Quoted</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              {/* Tab Content Area */}
              <TabsContent value={selectedTab} className="mt-0">
                {loading ? (
                   <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div> 
                ) : error ? (
                   <div className="text-center py-16 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                     <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                       {selectedTab === "new" ? (
                         <MessageSquare strokeWidth={1.5} className="h-full w-full" />
                       ) : selectedTab === "quoted" ? (
                         <Send strokeWidth={1.5} className="h-full w-full" />
                       ) : selectedTab === "accepted" ? (
                         <Check strokeWidth={1.5} className="h-full w-full" />
                       ) : (
                          <MessageSquare strokeWidth={1.5} className="h-full w-full" /> // Default icon
                       )}
                     </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No inquiries found</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTab === "new"
                        ? "New inquiries will appear here when available."
                        : selectedTab === "quoted"
                        ? "Your quotes will appear here once sent."
                        : selectedTab === "accepted"
                        ? "Accepted quotes will appear here."
                        : "No inquiries available in this category."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInquiries.map((inquiry) => (
                      <InquiryCard
                        key={inquiry.id}
                        inquiry={inquiry} // Pass live inquiry data
                        onQuote={handleOpenQuoteDialog}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Quote Dialog - Ensure this is directly inside the main fragment */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
          </DialogHeader>
          {selectedInquiryId && (
              <QuoteForm
                inquiryId={selectedInquiryId}
                onSubmit={handleSubmitQuote}
                onClose={handleCloseQuoteDialog}
              />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default OrganizerDashboard;
