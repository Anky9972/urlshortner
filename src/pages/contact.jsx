import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { BeatLoader } from "react-spinners";
import { SEOMetadata } from '@/components/seo-metadata';

const ContactPage = () => {
  const [messageSent, setMessageSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    setSendLoading(true);
    e.preventDefault();
    try {
      const res = await fetch(
        "https://pixlparadise.onrender.com/api/v1/sendmessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: details.name,
            sendersMail: details.email,
            phone: details.phone,
            message: details.message,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      const text = await res.text();
      if (!text) {
        throw new Error("Empty response from the server.");
      }

      const json = JSON.parse(text);

      if (json.status) {
        setSendLoading(false);
        setMessageSent(true);
      }
    } catch (error) {
      console.error(error);
      setSendLoading(false);
    }
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: <FaPhoneAlt className="w-5 h-5" />, text: "+1 212 965 9700" },
    { icon: <FaEnvelope className="w-5 h-5" />, text: "Morinfa@creatif.com" },
    { 
      icon: <FaMapMarkerAlt className="w-5 h-5" />, 
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <>
    <SEOMetadata
      title="Contact Us | TrimLink"
      description="Get in touch with our support team for help with URL shortening, QR codes, or any other inquiries. We're here to assist you."
      canonical="https://trimlink.netlify.app/contact"
      keywords="contact TrimLink, customer support, help desk, contact form, technical support, URL shortener support"
      // ogImage="https://trimlink.netlify.app/contact-preview.jpg"
      author="TrimLink"
      language="en"
  />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {messageSent ? (
        <motion.div 
          className="flex flex-col items-center justify-center space-y-6 text-center"
          variants={successVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">Message Sent Successfully!</h2>
          <p className="text-gray-300">We&apos;ll get back to you soon.</p>
          <Button 
            onClick={() => setMessageSent(false)}
            className="mt-6"
          >
            Send Another Message
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.div 
                  className="space-y-8"
                  variants={itemVariants}
                >
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Let&apos;s Talk</h1>
                    <p className="text-gray-400">We&apos;d love to hear from you</p>
                  </div>
                  
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-4 text-gray-300 bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {info.icon}
                        <span>{info.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <div className="flex space-x-4">
                      {['linkedin', 'youtube', 'instagram', 'facebook', 'twitter'].map((social) => (
                        <motion.a
                          key={social}
                          href={`#${social}`}
                          className="text-gray-400 hover:text-white transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <i className={`fab fa-${social} text-xl`}></i>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gray-700/30 p-6 rounded-lg"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                      { label: 'Name', name: 'name', type: 'text' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Phone', name: 'phone', type: 'tel' },
                    ].map((field) => (
                      <motion.div
                        key={field.name}
                        whileHover={{ scale: 1.01 }}
                        className="space-y-1"
                      >
                        <label className="block text-sm font-medium text-gray-300">
                          {field.label}
                        </label>
                        <Input
                          type={field.type}
                          name={field.name}
                          value={details[field.name]}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border-gray-600 text-white"
                          required
                        />
                      </motion.div>
                    ))}
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-medium text-gray-300">
                        Message
                      </label>
                      <Textarea
                        name="message"
                        value={details.message}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 border-gray-600 text-white"
                        rows={4}
                        required
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full py-3"
                        disabled={sendLoading}
                      >
                        {sendLoading ? (
                          <BeatLoader size={8} color="#ffffff" />
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default ContactPage;