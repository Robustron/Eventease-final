
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Mock data for inquiries
const MOCK_INQUIRIES = [
  {
    id: "inq-001",
    eventType: "Wedding",
    eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    description: "Looking for a complete wedding service package including catering, decoration, and photography for 100 guests.",
    location: "221 Baker Street, London",
    distance: 4.2, // in km
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    clientName: "Anonymous Client",
    status: "new",
  },
  {
    id: "inq-002",
    eventType: "Corporate Event",
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    description: "Annual company meeting requiring AV equipment, stage setup, and catering for 50 attendees.",
    location: "123 Business Park, London",
    distance: 2.8, // in km
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    clientName: "Anonymous Client",
    status: "new",
  },
  {
    id: "inq-003",
    eventType: "Birthday Party",
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    description: "Sweet 16 birthday party needing decoration, DJ services, and food for 30 guests.",
    location: "45 Parkview Avenue, London",
    distance: 7.3, // in km
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    clientName: "Anonymous Client",
    status: "quoted",
    quote: {
      amount: "£1200",
      message: "We can provide decoration, DJ services, and catering for your event.",
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    }
  },
  {
    id: "inq-004",
    eventType: "Conference",
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    description: "Tech conference requiring stage setup, audio equipment, and recording services for a day-long event.",
    location: "78 Tech Hub, London",
    distance: 5.1, // in km
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
    clientName: "Anonymous Client",
    status: "new",
  },
  {
    id: "inq-005",
    eventType: "Graduation Party",
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    description: "Graduation celebration needing photographer, catering, and decoration for 40 guests.",
    location: "91 College Road, London",
    distance: 3.5, // in km
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    clientName: "Anonymous Client",
    status: "accepted",
    quote: {
      amount: "£950",
      message: "We can provide a photographer, catering, and decoration for your graduation celebration.",
      submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
      acceptedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      clientName: "John Doe",
      clientEmail: "john.doe@example.com",
      clientPhone: "+1234567890"
    }
  },
];

// Placeholder function to send inquiry quote
const sendInquiryQuote = async (inquiryId: string, quote: { amount: string, message: string }): Promise<boolean> => {
  console.log("Sending quote for inquiry:", inquiryId, quote);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
  return true;
};

// Helper function to format time remaining
const getTimeRemaining = (createdAt: Date): string => {
  const expiryTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours after creation
  const now = new Date();
  const diffMs = expiryTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// InquiryCard Component
const InquiryCard = ({ inquiry, onQuote }: { inquiry: any; onQuote: (id: string) => void }) => {
  const timeRemaining = getTimeRemaining(inquiry.createdAt);
  const isExpired = timeRemaining === "Expired";
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{inquiry.eventType}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{inquiry.distance} km away</span>
            </div>
          </div>
          
          {inquiry.status === "new" && (
            <div className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <Clock className="h-3 w-3 mr-1" />
              <span>{timeRemaining}</span>
            </div>
          )}
          
          {inquiry.status === "quoted" && (
            <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              <span>Quoted</span>
            </div>
          )}
          
          {inquiry.status === "accepted" && (
            <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              <span>Accepted</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(inquiry.eventDate)}</span>
          </div>
          <p className="text-gray-700 text-sm line-clamp-3">{inquiry.description}</p>
        </div>
        
        {inquiry.status === "new" && (
          <button
            onClick={() => onQuote(inquiry.id)}
            disabled={isExpired}
            className={`w-full py-2 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
              isExpired 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-eventease-600 text-white hover:bg-eventease-700'
            }`}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Quote
          </button>
        )}
        
        {inquiry.status === "quoted" && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Quote:</span>
              <span className="font-semibold">{inquiry.quote.amount}</span>
            </div>
          </div>
        )}
        
        {inquiry.status === "accepted" && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Client:</span>
              <span className="font-semibold">{inquiry.quote.clientName}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <a href={`mailto:${inquiry.quote.clientEmail}`} className="text-sm text-eventease-600 hover:text-eventease-700 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {inquiry.quote.clientEmail}
              </a>
              <a href={`tel:${inquiry.quote.clientPhone}`} className="text-sm text-eventease-600 hover:text-eventease-700 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {inquiry.quote.clientPhone}
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// QuoteForm Component
const QuoteForm = ({ 
  inquiryId, 
  onSubmit, 
  onClose 
}: { 
  inquiryId: string; 
  onSubmit: (quoteData: { amount: string, message: string }) => Promise<void>;
  onClose: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({ amount, message });
      onClose();
    } catch (error) {
      console.error("Failed to submit quote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Quote Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">£</span>
          </div>
          <input
            type="text"
            id="amount"
            className="input-field w-full pl-8"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message to Client
        </label>
        <textarea
          id="message"
          className="input-field w-full"
          rows={4}
          placeholder="Describe what's included in your quote..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
      </div>
      
      <div className="pt-2 flex space-x-3">
        <Button 
          variant="outline"
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-eventease-600 text-white hover:bg-eventease-700"
        >
          {isSubmitting ? "Submitting..." : "Send Quote"}
        </Button>
      </div>
    </form>
  );
};

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/organizer/login");
    }
  }, [isAuthenticated, navigate]);
  
  const handleOpenQuoteDialog = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setIsQuoteDialogOpen(true);
  };
  
  const handleSubmitQuote = async (quoteData: { amount: string, message: string }) => {
    if (!selectedInquiryId) return;
    
    try {
      const success = await sendInquiryQuote(selectedInquiryId, quoteData);
      
      if (success) {
        // Update the inquiries state
        setInquiries(prevInquiries => 
          prevInquiries.map(inquiry => 
            inquiry.id === selectedInquiryId
              ? {
                  ...inquiry,
                  status: "quoted",
                  quote: {
                    amount: quoteData.amount,
                    message: quoteData.message,
                    submittedAt: new Date(),
                  },
                }
              : inquiry
          )
        );
        
        toast({
          title: "Quote Sent",
          description: "Your quote has been successfully sent to the client.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Send Quote",
        description: "There was an error sending your quote. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter inquiries based on selected tab
  const filteredInquiries = inquiries.filter(inquiry => {
    if (selectedTab === "all") return true;
    return inquiry.status === selectedTab;
  });
  
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
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your event inquiries and quotes
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="bg-white shadow-sm rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500">Your service area</p>
                  <p className="font-medium text-gray-900">100 km radius</p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="new" onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="quoted">Quoted</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-0">
                {filteredInquiries.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                      {selectedTab === "new" ? (
                        <MessageSquare className="h-full w-full" />
                      ) : selectedTab === "quoted" ? (
                        <Send className="h-full w-full" />
                      ) : (
                        <Check className="h-full w-full" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No inquiries found</h3>
                    <p className="text-gray-500">
                      {selectedTab === "new"
                        ? "New inquiries will appear here when available."
                        : selectedTab === "quoted"
                        ? "Your quotes will appear here once sent."
                        : selectedTab === "accepted"
                        ? "Accepted quotes will appear here."
                        : "No inquiries available."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInquiries.map((inquiry) => (
                      <InquiryCard
                        key={inquiry.id}
                        inquiry={inquiry}
                        onQuote={handleOpenQuoteDialog}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
      
      {/* Quote Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Quote to Client</DialogTitle>
          </DialogHeader>
          <QuoteForm
            inquiryId={selectedInquiryId || ""}
            onSubmit={handleSubmitQuote}
            onClose={() => setIsQuoteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default OrganizerDashboard;
