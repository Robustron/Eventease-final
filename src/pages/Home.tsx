import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const Home = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 hero-gradient">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 text-center md:text-left text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Event Planning Made Simple
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Connect with top-rated event service providers. Get quotes, compare options, and create unforgettable experiences.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link
                  to="/customer/login"
                  className="btn-secondary hover:bg-white/90 text-lg px-8 py-3 rounded-md"
                >
                  Submit Inquiry / Get Started
                </Link>
                <Link
                  to="/organizer/login"
                  className="btn-secondary border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-lg px-8 py-3 rounded-md"
                >
                  Organizer Login
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="md:w-1/2 mt-12 md:mt-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative mx-auto" style={{ maxWidth: "500px" }}>
                <div className="absolute inset-0 bg-eventease-300 rounded-lg transform rotate-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Event planning"
                  className="relative shadow-lg rounded-lg w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How EventEase Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simplified process to connect you with the perfect service providers for your event
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-md text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-eventease-100 text-eventease-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Submit Your Inquiry</h3>
              <p className="text-gray-600">
                Tell us about your event needs through our simple submission form.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-lg shadow-md text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-eventease-100 text-eventease-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive Quotes</h3>
              <p className="text-gray-600">
                Local service providers will send you personalized quotes for your consideration.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-lg shadow-md text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-eventease-100 text-eventease-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose & Connect</h3>
              <p className="text-gray-600">
                Select the best option and finalize the details directly with your chosen provider.
              </p>
            </motion.div>
          </motion.div>

          <div className="text-center mt-12">
            <Link
              to="/customer/login"
              className="btn-primary inline-block px-8 py-3 text-lg"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from people who have successfully planned their events with EventEase
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah J.",
                role: "Wedding Planner",
                quote: "EventEase made it incredibly simple to find vendors for my client's destination wedding. The quotes were competitive and response times were impressively fast.",
              },
              {
                name: "Michael T.",
                role: "Corporate Event Manager",
                quote: "As someone who organizes quarterly corporate events, I can't imagine going back to the old way of finding service providers. EventEase has streamlined my entire process.",
              },
              {
                name: "Priya K.",
                role: "Birthday Party Host",
                quote: "I was planning my daughter's sweet sixteen and had no idea where to start. EventEase connected me with amazing vendors who made her day truly special.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 md:p-8 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-eventease-100 rounded-full flex items-center justify-center text-eventease-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-eventease-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to plan your next event?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Join thousands of satisfied customers who have used EventEase to create memorable experiences.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/customer/login"
                  className="bg-white text-eventease-600 hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors"
                >
                  Submit an Inquiry / Get Started
                </Link>
                <Link
                  to="/organizer/login"
                  className="border border-white/50 hover:bg-white/10 backdrop-blur-sm text-white font-medium text-lg px-8 py-3 rounded-md transition-colors"
                >
                  Are You an Organizer?
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
