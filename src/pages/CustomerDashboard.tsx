import * as React from 'react';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle, Calendar, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

// Import Firebase functions
import { db } from "@/firebaseConfig";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    Timestamp, 
    orderBy 
} from "firebase/firestore";

// --- Data Types ---
interface Quote { // Basic quote info for display
  amount: number;
  currency: string;
  submittedAt: Timestamp;
}

interface Inquiry {
  id: string; // Firestore document ID
  eventType: string;
  eventDate: Timestamp;
  description: string;
  clientId: string; 
  status: "new" | "quoted" | "accepted" | "declined" | "cancelled";
  createdAt: Timestamp;
  quote?: Quote | null; // Include basic quote info if available
}

// --- Helper function to format date from Timestamp ---
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return "N/A";
  return timestamp.toDate().toLocaleDateString("en-GB", { // Using en-GB for dd/mm/yyyy, adjust as needed
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

// --- Inquiry Card Component (Simplified for Customer View) ---
const CustomerInquiryCard = ({ inquiry }: { inquiry: Inquiry }) => {
    return (
        <Link 
            to={`/quote/${inquiry.id}`} // Link to the detailed quote page
            className="block p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 sm:mb-0">{inquiry.eventType}</h3>
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
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{inquiry.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                 <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>Event Date: {formatDate(inquiry.eventDate)}</span>
                 </div>
                {/* Show quoted amount if available */} 
                {inquiry.status === 'quoted' && inquiry.quote && (
                    <span className="font-medium text-eventease-600">
                        Quote: {formatCurrency(inquiry.quote.amount, inquiry.quote.currency)}
                    </span>
                )}
                 {inquiry.status === 'accepted' && inquiry.quote && (
                    <span className="font-medium text-green-600">
                        Accepted: {formatCurrency(inquiry.quote.amount, inquiry.quote.currency)}
                    </span>
                )}
            </div>
        </Link>
    );
};

// --- Customer Dashboard Component ---
const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // Use Inquiry type
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast({ title: "Access Denied", description: "Please log in to view your dashboard.", variant: "destructive" });
      navigate("/customer/login");
      return;
    }

    if (currentUser) {
      setIsLoadingInquiries(true);
      // Create the query
      const q = query(
        collection(db, "inquiries"), 
        where("clientId", "==", currentUser.uid), // Filter by clientId
        orderBy("createdAt", "desc") // Order by creation date
      );

      // Set up the listener
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const inquiriesData: Inquiry[] = [];
          querySnapshot.forEach((doc) => {
            inquiriesData.push({ ...doc.data(), id: doc.id } as Inquiry);
          });
          setInquiries(inquiriesData);
          setIsLoadingInquiries(false);
        },
        (error) => {
          console.error("Error fetching customer inquiries:", error);
          toast({ title: "Error Loading Inquiries", description: "Could not load your inquiries. Please try again later.", variant: "destructive" });
          setIsLoadingInquiries(false);
        }
      );
      
      // Cleanup listener on unmount or when user changes
      return () => unsubscribe();
    } else {
        // No user, not loading (already handled by initial check)
        setIsLoadingInquiries(false); 
        setInquiries([]); // Clear inquiries if user logs out
    }
      
  }, [currentUser, authLoading, navigate, toast]);

  // --- Loading State --- 
  if (authLoading || (!currentUser && !authLoading)) { 
      // Show loader if auth is loading OR if auth is done but there's no user (avoids flicker before redirect)
      return (
          <>
              <Navbar />
              <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-eventease-500" />
              </div>
              <Footer />
          </>
      );
  }

  // --- Main Dashboard Render --- 
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 pt-24 min-h-screen">
        <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold">My Dashboard</h1>
             <Link to="/submit-inquiry">
                 <Button className="btn-primary">
                     <PlusCircle className="mr-2 h-4 w-4" /> Submit New Inquiry
                 </Button>
             </Link>
        </div>

        <h2 className="text-2xl font-semibold mb-4">My Inquiries</h2>
         {isLoadingInquiries ? ( // Show loader specifically for inquiries
             <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>
         ) : inquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600">You haven't submitted any inquiries yet.</p>
            <Link to="/submit-inquiry" className="mt-4 inline-block">
                 <Button className="btn-primary">
                     <PlusCircle className="mr-2 h-4 w-4" /> Submit Your First Inquiry
                 </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map over inquiries state and render Inquiry cards */} 
            {inquiries.map((inquiry) => (
                <CustomerInquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

export default CustomerDashboard; 