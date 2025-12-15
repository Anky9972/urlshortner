import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, Check, ArrowLeft } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { SEOMetadata } from '@/components/seo-metadata';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
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
    { icon: Phone, label: "Phone", value: "+1 212 965 9700" },
    { icon: Mail, label: "Email", value: "support@trimlink.com" },
    { icon: MapPin, label: "Location", value: "San Francisco, CA" }
  ];

  if (messageSent) {
    return (
      <>
        <SEOMetadata
          title="Contact Us | TrimLink"
          description="Get in touch with our support team."
          canonical="https://trimlynk.com/contact"
        />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
            <p className="text-zinc-400 mb-6">We&apos;ll get back to you within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setMessageSent(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
              >
                Send Another Message
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOMetadata
        title="Contact Us | TrimLink"
        description="Get in touch with our support team for help with URL shortening, QR codes, or any other inquiries."
        canonical="https://trimlynk.com/contact"
        keywords="contact TrimLink, customer support, help desk"
        author="TrimLink"
        language="en"
      />

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Get in Touch</h1>
            <p className="text-zinc-400">We&apos;d love to hear from you</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <motion.div
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <info.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">{info.label}</p>
                    <p className="text-white">{info.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Name</label>
                      <Input
                        type="text"
                        name="name"
                        value={details.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={details.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Phone (optional)</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={details.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Message</label>
                    <Textarea
                      name="message"
                      value={details.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 min-h-[120px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sendLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold h-11"
                  >
                    {sendLoading ? (
                      <BeatLoader size={8} color="#09090b" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;