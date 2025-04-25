import { useState, FormEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Firebase imports
import { db, auth } from "@/firebaseConfig";
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
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const [aiInteractionLog, setAiInteractionLog] = useState<string[]>([]);
  const [aiChatSession, setAiChatSession] = useState<ChatSession | null>(null);
  const [aiRefinementInput, setAiRefinementInput] = useState("");
  const [isAiRefining, setIsAiRefining] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiInteractionLog]);

  const [formData, setFormData] = useState({
    eventType: "",
    eventDate: null as Date | null,
    description: "",
    location: "",
    name: "",
    email: "",
    phone: "",
    expectedGuests: "",
    budgetRange: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== 3) {
        toast({ title: "Incomplete Form", description: "Please complete all steps.", variant: "destructive" });
        return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
        toast({ title: "Missing Contact Info", description: "Please provide your name, email, and phone.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    
    // Get current user before the try block
    const currentUser = auth.currentUser; 

    // Add check for logged-in user
    if (!currentUser) {
        toast({
            title: "Authentication Required",
            description: "You must be logged in to submit an inquiry.",
            variant: "destructive",
        });
        setIsSubmitting(false); // Stop submission
        return; // Exit the function
    }

    try {
       const inquiryData = {
         clientId: currentUser.uid,
         eventType: formData.eventType,
         eventDate: formData.eventDate ? Timestamp.fromDate(formData.eventDate) : null,
         description: enhancedDescription ?? formData.description,
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

      console.log("Submitting Inquiry Data:", inquiryData); // Optional: Log the data being sent
      const docRef = await addDoc(collection(db, "inquiries"), inquiryData);
      
      toast({
        title: "Inquiry Submitted",
        description: "Your event inquiry has been successfully submitted!",
        variant: "default",
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
        budgetRange: "",
      });
      setCurrentStep(1);
      setEnhancedDescription(null);

    } catch (error) {
      console.error("Error submitting inquiry to Firebase:", error);
      toast({
        title: "Submission Failed",
        description: `Could not save your inquiry. Error: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEnhanceWithAi = async () => {
      if (!formData.eventType || !formData.eventDate || !formData.description || !formData.location) {
          toast({
              title: "Missing Information",
              description: "Please provide Event Type, Date, Location, and a brief Description before enhancing.",
              variant: "destructive",
          });
          return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
          toast({
              title: "API Key Missing",
              description: "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.",
              variant: "destructive",
          });
          return;
      }

      setIsAiEnhancing(true);
      setIsAiRefining(true);
      setShowAiModal(true);
      setAiInteractionLog(["AI: Generating initial enhancement..."]);
      setEnhancedDescription(null);
      setAiChatSession(null);

      try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const chat = model.startChat({
               history: [
                 {
                   role: "user",
                   parts: [{ text: "You are a helpful event planning assistant. Your goal is to refine event descriptions based on user feedback. Keep responses concise and focused on the description." }],
                 },
                 {
                   role: "model",
                   parts: [{ text: "Okay, I understand. I'm ready to help enhance the event description. Please provide the initial details." }],
                 },
               ],
          });
          setAiChatSession(chat);

          const dateString = formData.eventDate ? format(formData.eventDate, "PPP") : "Not specified";
          const initialUserMessage = `System Preamble: You are "Eve," an AI Event Visionary & Experience Designer. Your goal is to take raw event details and transform them into a compelling, imaginative, and practical event concept. You think creatively, consider the atmosphere and guest experience, and provide tangible starting points, including budget considerations.

**User Provided Foundation:**
*   **Event Occasion:** ${formData.eventType}
*   **Target Date:** ${dateString}
*   **Proposed Setting:** ${formData.location}
*   **Guest Estimate:** ${formData.expectedGuests || 'Not specified - Assume small group unless description suggests otherwise'}
*   **Ballpark Budget (INR ₹):** ${formData.budgetRange || 'Flexible / To be determined'}
*   **Initial Idea / Vibe:** ${formData.description}

**Your Creative Mandate:**
Based on the user's foundation, architect a preliminary vision for this event. Go beyond simple suggestions; aim to inspire!

**1. Craft an Evocative Vision Statement:**
*   Don't just rewrite the description. Imagine the peak moment of the event. What does it feel like, sound like, look like?
*   Distill the user's initial idea into a compelling narrative or thematic concept. Give it a hook or a captivating name/theme idea (even if preliminary).
*   Infuse it with sensory details and emotion relevant to the Event Occasion and Initial Idea.

**2. Develop an "Experience Blueprint" (Key Elements & Activities):**
*   Based on the Vision Statement and available details (especially Event Occasion, Setting, Ballpark Budget), propose 3-5 interconnected elements or activities that bring the vision to life.
*   Think holistically: Consider flow, atmosphere, engagement, and potential "wow" factors.
*   Examples: Suggest specific types of entertainment (live music genre, specific type of performer, interactive game), unique catering ideas (themed food stations, signature cocktail concept), decor concepts (lighting style, color palette, key pieces), or special moments (a planned toast, a unique guest interaction).
*   Briefly justify why each element fits the vision and is likely feasible within the general budget constraints.

**3. Sketch a Preliminary Budget Allocation:**
*   Based on the Ballpark Budget (even if vague) and the Experience Blueprint, provide a suggested, hypothetical percentage or range breakdown for key event categories (e.g., Venue: 20-30%, F&B: 30-40%, Entertainment: 15-25%, Decor: 10-20%, Contingency: 10-15%).
*   Typical categories include: Venue/Location Fees, Food & Beverage, Entertainment/Activities, Decor/Ambiance, Staffing/Service, Contingency (Essential! Suggest 10-15%).
*   State clearly that this is a preliminary estimate to guide thinking, heavily dependent on specific choices. If the budget is "Flexible," provide a breakdown for a modest interpretation first, perhaps noting where costs could scale up.

**4. Initiate the Refinement Dialogue (CRITICAL):**
*   End by explicitly inviting collaboration to flesh out the details. Frame it as moving from concept to concrete plan.
*   Ask targeted questions based on the concept you just presented, such as:
    *   "Does this initial vision of a '[Your Theme Idea]' resonate with you? What aspects excite you most?"
    *   "Regarding the proposed [Specific Activity/Element], how does that align with your priorities? Are there specific guest preferences (age range, interests) we should focus on?"
    *   "The budget sketch assumes [mention a key assumption, e.g., 'moderate F&B spending']. Are there areas where you'd prefer to allocate more or less resource (e.g., is high-end catering more critical than elaborate decor)?"
    *   "To make this even more tailored, could you share more about the desired overall atmosphere (e.g., relaxed & casual, sophisticated & elegant, high-energy & fun)?"
    *   "Are there any 'must-haves' or absolute 'no-gos' we should incorporate from the start?"

Now, generate the Vision Statement, Experience Blueprint, Budget Allocation Sketch, and the Refinement Dialogue questions based *only* on the user's details provided above.`;

          const result = await chat.sendMessage(initialUserMessage);
          const response = result.response;
          const text = response.text();

          setEnhancedDescription(text);
          setAiInteractionLog(prev => [prev[0].replace("Generating initial enhancement...", `Initial request sent.`), `AI: ${text}`]);

      } catch (error) {
          console.error("Error starting AI chat:", error);
          toast({
              title: "AI Initialization Failed",
              description: "Could not start the enhancement session. Please try again later.",
              variant: "destructive",
          });
          setShowAiModal(false);
          setAiChatSession(null);
      } finally {
          setIsAiRefining(false);
          setIsAiEnhancing(false);
      }
  };

  const sendRefinementRequest = async () => {
    if (!aiRefinementInput.trim() || !aiChatSession || isAiRefining) {
      return;
    }

    const userMessage = aiRefinementInput.trim();
    setAiInteractionLog(prev => [...prev, `USER: ${userMessage}`]);
    setAiRefinementInput("");
    setIsAiRefining(true);

    try {
      const result = await aiChatSession.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      setEnhancedDescription(text);
      setAiInteractionLog(prev => [...prev, `AI: ${text}`]);

    } catch (error) {
       console.error("Error sending refinement to AI:", error);
       toast({
           title: "AI Refinement Failed",
           description: "Could not get refinement from AI. Please try again.",
           variant: "destructive",
       });
       setAiInteractionLog(prev => [...prev, `SYSTEM: Error receiving AI response.`]);
    } finally {
       setIsAiRefining(false);
    }
  };

  const acceptAiDescription = () => {
      if (enhancedDescription) {
          setFormData(prev => ({ ...prev, description: enhancedDescription }));
          toast({ title: "Description Updated", description: "AI-enhanced description applied." });
      }
      setShowAiModal(false);
      setAiInteractionLog([]);
  };

  const cancelAiEnhancement = () => {
    setShowAiModal(false);
    setEnhancedDescription(null);
    setAiInteractionLog([]);
    setAiChatSession(null);
    setIsAiEnhancing(false);
    setIsAiRefining(false);
    setAiRefinementInput("");
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.eventType || !formData.eventDate) {
        toast({
          title: "Missing Information",
          description: "Please select an Event Type and Date before proceeding",
          variant: "destructive",
        });
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.location) {
        toast({
          title: "Missing Information",
          description: "Please enter the Event Location before proceeding",
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
                  Event Basics
                </div>
                <div className={currentStep >= 2 ? 'text-eventease-600 font-medium' : 'text-gray-500'}>
                  Location & Guests
                </div>
                <div className={currentStep >= 3 ? 'text-eventease-600 font-medium' : 'text-gray-500'}>
                  Description & Contact
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
                    
                    <div className="flex justify-end pt-4">
                       <Button type="button" onClick={nextStep} className="btn-primary">
                           Next: Location & Guests
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
                    
                    <div>
                      <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Budget Range (Optional, in INR ₹)
                      </label>
                      <input
                        type="text"
                        id="budgetRange"
                        name="budgetRange"
                        className="input-field w-full"
                        placeholder="e.g., ₹50,000 - ₹1,00,000, Flexible, etc."
                        value={formData.budgetRange}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                       <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                       <Button type="button" onClick={nextStep} className="btn-primary">
                           Next: Description & Contact
                       </Button>
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
                      <div className="mt-2 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleEnhanceWithAi}
                          disabled={isAiEnhancing || !formData.description}
                          className="text-sm"
                         >
                           {isAiEnhancing ? (
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           ) : (
                             <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                           )}
                           Enhance with AI
                         </Button>
                      </div>
                    </div>
                    
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
      
      <Dialog open={showAiModal} onOpenChange={(open) => !open && cancelAiEnhancement()}>
       <DialogContent className="sm:max-w-[600px]">
         <DialogHeader>
           <DialogTitle>Enhance Event Description with AI</DialogTitle>
           <DialogDescription>
             Review the AI-generated description below. You can accept it or ask for refinements.
           </DialogDescription>
         </DialogHeader>
         <div
           ref={chatContainerRef}
           className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto p-4 border rounded bg-gray-50/50"
         >
            {isAiRefining && aiInteractionLog.length <= 1 && (
                 <div className="flex items-center justify-center p-4">
                     <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                     <span className="ml-2 text-gray-500">Generating initial description...</span>
                  </div>
              )}
             {aiInteractionLog.slice(1).map((msg, index) => (
               <div key={index} className={`flex ${msg.startsWith('AI:') ? 'justify-start' : 'justify-end'}`}>
                 <p className={`text-sm p-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${
                   msg.startsWith('AI:')
                     ? 'bg-blue-100 text-blue-900'
                     : 'bg-eventease-100 text-eventease-900'
                 }`}>
                   {msg.substring(msg.indexOf(':') + 2)}
                 </p>
               </div>
             ))}
             {isAiRefining && aiInteractionLog.length > 1 && (
               <div className="flex justify-start">
                 <p className="text-sm p-2 rounded-lg bg-gray-200 animate-pulse">
                   AI thinking...
                 </p>
               </div>
             )}
         </div>

         {/* Input area for refinement */}
         <div className="mt-4 flex gap-2 items-end"> {/* Ensure items align nicely */}
             <Textarea
               placeholder="Ask for changes (e.g., 'Make it more formal', 'Add details about the birthday person')..."
               value={aiRefinementInput}
               onChange={(e) => setAiRefinementInput(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault(); // Prevent newline on Enter
                   sendRefinementRequest();
                 }
               }}
               rows={2}
               className="flex-1 resize-none"
               disabled={isAiRefining || !aiChatSession} // Disable while refining or if chat not ready
             />
             <Button
               onClick={sendRefinementRequest}
               disabled={isAiRefining || !aiRefinementInput.trim() || !aiChatSession} // Disable if no input, refining, or no chat
               size="icon" // Make button square
               aria-label="Send refinement request"
               className="shrink-0" // Prevent button from shrinking
             >
               {isAiRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
             </Button>
         </div>

         <DialogFooter className="mt-6 gap-2 sm:justify-between">
             <Button variant="outline" onClick={cancelAiEnhancement}>Cancel</Button>
             <Button
               onClick={acceptAiDescription}
               disabled={isAiRefining || !enhancedDescription} // Disable while refining or if no description generated yet
               className="btn-primary"
              >
                Accept Current Description
              </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>

      <Footer />
    </>
  );
};

export default InquiryForm;
