import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Firebase imports
import { db } from "@/firebaseConfig";
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Conference",
  "Workshop",
  "Graduation Party",
  "Anniversary",
  "Retirement Party",
  "Baby Shower",
  "Other",
];

const InquiryForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    eventType: "",
    eventDate: null as Date | null,
    description: "",
    location: "",
    name: "",
    email: "",
    phone: "",
    expectedGuests: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== 3) {
        toast({ title: "Incomplete Form", description: "Please complete all steps.", variant: "warning" });
        return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
        toast({ title: "Missing Contact Info", description: "Please provide your name, email, and phone.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    
    try {
       const inquiryData = {
         eventType: formData.eventType,
         eventDate: formData.eventDate ? Timestamp.fromDate(formData.eventDate) : null,
         description: formData.description,
         location: formData.location, 
         name: formData.name,
         email: formData.email,
         phone: formData.phone,
         expectedGuests: formData.expectedGuests ? Number(formData.expectedGuests) : 0,
         status: "new" as const,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp(),
         quote: null,
         organizerId: null,
       };

      const docRef = await addDoc(collection(db, "inquiries"), inquiryData);
      
      toast({
        title: "Inquiry Submitted",
        description: "Your event inquiry has been successfully submitted!",
        variant: "success",
      });

      setFormData({
        eventType: "",
        eventDate: null,
        description: "",
        location: "",
        name: "",
        email: "",
        phone: "",
        expectedGuests: "",
      });
      setCurrentStep(1);

    } catch (error) {
      console.error("Error submitting inquiry to Firebase:", error);
      toast({
        title: "Submission Failed",
        description: "Could not save your inquiry to the database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.eventType || !formData.eventDate || !formData.description) {
        toast({
          title: "Missing Information",
          description: "Please fill in all the required fields before proceeding",
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Submit an Event Inquiry</h1>
              <p className="text-gray-600 mt-2">
                Tell us about your event and get quotes from local service providers
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className={`flex-1 h-2 ${currentStep >= 1 ? 'bg-eventease-500' : 'bg-gray-300'}`}></div>
                <div className={`flex-1 h-2 mx-1 ${currentStep >= 2 ? 'bg-eventease-500' : 'bg-gray-300'}`}></div>
                <div className={`flex-1 h-2 ${currentStep >= 3 ? 'bg-eventease-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div className={currentStep >= 1 ? 'text-eventease-600 font-medium' : 'text-gray-500'}>
                  Event Details
                </div>
                <div className={currentStep >= 2 ? 'text-eventease-600 font-medium' : 'text-gray-500'}>
                  Location
                </div>
                <div className={currentStep >= 3 ? 'text-eventease-600 font-medium' : 'text-gray-500'}>
                  Contact Info
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type*
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        className="input-field w-full"
                        value={formData.eventType}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select an event type
                        </option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Date*
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.eventDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.eventDate ? (
                              format(formData.eventDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.eventDate || undefined}
                            onSelect={(date) => setFormData({ ...formData, eventDate: date })}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Event Description*
                        </label>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        rows={5}
                        className="input-field w-full"
                        placeholder="Describe your event, requirements, and any special considerations..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                       <Button type="button" onClick={nextStep} className="btn-primary">
                           Next: Location
                       </Button>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 2 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Location*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className="input-field w-full"
                        placeholder="Address or venue name"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="expectedGuests" className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Number of Guests
                      </label>
                      <input
                        type="number"
                        id="expectedGuests"
                        name="expectedGuests"
                        className="input-field w-full"
                        placeholder="Approximate number of attendees"
                        value={formData.expectedGuests}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-500 mb-2">Location Map Preview</p>
                      <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                        <p className="text-gray-400">
                          Map would appear here based on location input
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter a specific address above for an accurate map view
                      </p>
                    </div>
                    <div className="flex justify-between pt-4">
                       <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                       <Button type="button" onClick={nextStep} className="btn-primary">Next: Contact Info</Button>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input-field w-full"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input-field w-full"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="input-field w-full"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        By submitting this form, you agree to our{" "}
                        <Link to="#" className="text-eventease-600 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="#" className="text-eventease-600 hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                      <p>
                        Your contact information will only be shared with service providers once you
                        accept their quote.
                      </p>
                    </div>
                    <div className="flex justify-between pt-4">
                       <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                       <Button type="submit" disabled={isSubmitting} className="btn-primary">
                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Inquiry"}
                       </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </>
  );
};

export default InquiryForm;
