import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import Features from "@/components/features";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState('');
  const navigate = useNavigate();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) navigate(`/auth?createNew=${longUrl}`);
  };

  const faqs = [
    {
      question: "How long does a short URL last?",
      answer: "By default, short URLs do not expire. However, you can set an expiration date if desired."
    },
    {
      question: "Can I track the performance of my short URLs?",
      answer: "Yes, you can track the number of clicks, geographic location, and referrers with our detailed analytics."
    },
    {
      question: "Is there a limit to the number of URLs I can shorten?",
      answer: "There is no limit for registered users. Free users might have a daily limit to prevent abuse."
    },
    {
      question: "Can I customize my short URL?",
      answer: "Yes, you can create personalized short URLs for easier recall and better branding."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center gap-16 px-4 py-12 bg-gradient-to-b from-gray-900 to-gray-950"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <motion.h2 
          className="text-3xl sm:text-6xl lg:text-7xl text-white font-extrabold tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          The only URL Shortener <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            you&rsquo;ll ever need!
          </span>
        </motion.h2>
      </motion.div>

      {/* URL Shortener Form */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleShorten}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter your long URL here..."
            className="h-12 sm:h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button 
            className="h-12 sm:h-14 px-8 font-bold"
            type="submit"
          >
            Shorten Now!
          </Button>
        </div>
      </motion.form>

      {/* Features Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <Features />
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-4xl mx-auto px-4"
      >
        <h1 className="text-4xl font-bold text-white text-center mb-10">
          Frequently Asked Questions
        </h1>
        <Accordion type="multiple" className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <AccordionItem 
                value={`item-${index}`}
                className="bg-gray-800/30 rounded-lg border border-gray-700"
              >
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-800/50 rounded-t-lg transition-colors">
                  <span className="text-left text-white">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;