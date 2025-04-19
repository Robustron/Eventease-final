
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

// Mock data for a specific event inquiry and quote
const MOCK_EVENT = {
  id: "evt-001",
  eventType: "Wedding",
  eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  description: "Looking for a complete wedding service package including catering, decoration, and photography for 100 guests.",
  location: "221 Baker Street, London",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  status: "quoted",
  quote: {
    organizerName: "Premium Events Ltd",
    amount: "£3,500",
    message: "We're excited to help make your wedding day special! Our comprehensive package includes:\n\n- Full-service catering for 100 guests\n- Elegant venue decoration\n- Professional photography (8 hours)\n- DJ and sound equipment\n- Event coordination on the day\n\nWe have extensive experience with weddings of this size and would be happy to discuss any specific requirements.",
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  }
};

// Placeholder function to accept quote
const acceptQuote = async (eventId: string): Promise<boolean> => {
  console.log("Accepting quote for event:", eventId);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
  return true;
};

// Placeholder function to decline quote
const declineQuote = async (eventId: string): Promise<boolean> => {
  console.log("Declining quote for event:", eventId);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
  return true;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const QuotePage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<typeof MOCK_EVENT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  useEffect(() => {
    // Simulate API call to fetch event data
    setTimeout(() => {
      // In a real app, we'd fetch the specific event using eventId
      setEvent(MOCK_EVENT);
      setIsLoading(false);
    }, 1000);
  }, [eventId]);
  
  const handleAcceptQuote = async () => {
    if (!event) return;
    
    setIsAccepting(true);
    try {
      const success = await acceptQuote(event.id);
      if (success) {
        setEvent({
          ...event,
          status: "accepted",
        });
        toast({
          title: "Quote Accepted",
          description: "The organizer has been notified and will contact you soon.",
        });
        setShowContactInfo(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept the quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleDeclineQuote = async () => {
    if (!event) return;
    
    setIsDeclining(true);
    try {
      const success = await declineQuote(event.id);
      if (success) {
        setEvent({
          ...event,
          status: "declined",
        });
        toast({
          title: "Quote Declined",
          description: "The organizer has been notified.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline the quote. Please try again.",
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
        <div className="min-h-screen pt-24 pb-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-eventease-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading event details...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
                <p className="text-gray-600 mb-6">
                  The event you're looking for does not exist or may have been removed.
                </p>
                <Link
                  to="/"
                  className="btn-primary inline-block"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
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
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link
                to="/"
                className="text-sm text-eventease-600 hover:text-eventease-700 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {event.eventType}
                    </h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-eventease-100 text-eventease-800">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(event.eventDate)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-6 mb-6">
                  <h2 className="text-lg font-semibold mb-3">Event Description</h2>
                  <p className="text-gray-700">{event.description}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Quote from {event.quote.organizerName}</h2>
                    <span className="text-xl font-bold text-gray-900">{event.quote.amount}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="bg-white rounded-md p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">{event.quote.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Quoted on {formatDate(event.quote.submittedAt)} at {formatTime(event.quote.submittedAt)}</span>
                  </div>
                </div>
                
                {event.status === "quoted" && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleAcceptQuote}
                      disabled={isAccepting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isAccepting ? "Processing..." : "Accept Quote"}
                    </Button>
                    
                    <Button
                      onClick={handleDeclineQuote}
                      disabled={isDeclining}
                      variant="outline"
                      className="flex-1"
                    >
                      {isDeclining ? "Processing..." : "Decline Quote"}
                    </Button>
                  </div>
                )}
                
                {event.status === "accepted" && (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Quote Accepted</h3>
                        <p className="text-green-700 text-sm mt-1">
                          You've accepted this quote. The organizer has been notified and will contact you soon.
                        </p>
                      </div>
                    </div>
                    
                    {showContactInfo && (
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold mb-3">Organizer Contact Information</h3>
                        <div className="space-y-2">
                          <p className="text-gray-800">
                            <span className="font-medium">Name:</span> Premium Events Ltd
                          </p>
                          <p className="text-gray-800">
                            <span className="font-medium">Email:</span>{" "}
                            <a href="mailto:contact@premiumevents.com" className="text-eventease-600 hover:underline">
                              contact@premiumevents.com
                            </a>
                          </p>
                          <p className="text-gray-800">
                            <span className="font-medium">Phone:</span>{" "}
                            <a href="tel:+441234567890" className="text-eventease-600 hover:underline">
                              +44 123 456 7890
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {event.status === "declined" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center mr-3 mt-0.5">
                      <X className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Quote Declined</h3>
                      <p className="text-gray-700 text-sm mt-1">
                        You've declined this quote. Feel free to submit a new inquiry if needed.
                      </p>
                    </div>
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
