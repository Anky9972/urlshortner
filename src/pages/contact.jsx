import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Mail,
    MapPin,
    Send,
    Check,
    ArrowLeft,
    MessageSquare,
    Sparkles,
    Clock,
    Globe,
} from "lucide-react";
import { BeatLoader } from "react-spinners";
import { SEOMetadata } from "@/components/seo-metadata";
import { useNavigate } from "react-router-dom";

const ContactPage = () => {
    const navigate = useNavigate();
    const [messageSent, setMessageSent] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: details.name,
                        sendersMail: details.email,
                        phone: details.phone,
                        message: details.message,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to send message.");

            const text = await res.text();
            if (!text) throw new Error("Empty response.");

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
        {
            icon: Mail,
            label: "Email",
            value: "ankygaur9972@gmail.com",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            icon: MapPin,
            label: "Location",
            value: "San Francisco, CA",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
    ];

    const features = [
        { icon: Clock, text: "24hr response time" },
        { icon: Globe, text: "Global support" },
        { icon: Sparkles, text: "Priority for Pro users" },
    ];

    if (messageSent) {
        return (
            <>
                <SEOMetadata
                    title="Contact Us | TrimLink"
                    description="Get in touch with our support team."
                    canonical={`${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}/contact`}
                />
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[hsl(230,15%,5%)]">
                    <motion.div
                        className="text-center max-w-md"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6"
                        >
                            <Check className="w-10 h-10 text-emerald-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Message Sent!
                        </h2>
                        <p className="text-slate-400 mb-8">
                            We&apos;ll get back to you within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => {
                                    setMessageSent(false);
                                    setDetails({ name: "", email: "", phone: "", message: "" });
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 font-semibold"
                            >
                                Send Another Message
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/")}
                                className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)] rounded-xl h-11"
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
                canonical={`${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}/contact`}
                keywords="contact TrimLink, customer support, help desk"
                author="TrimLink"
                language="en"
            />

            <div className="min-h-screen bg-[hsl(230,15%,5%)] py-12 px-4 relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-20 -left-32 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 -right-32 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto relative">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 mb-5"
                        >
                            <MessageSquare className="w-7 h-7 text-blue-400" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Get in Touch
                        </h1>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Have a question or need help? We&apos;d love to hear from you.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                            {features.map((f, i) => (
                                <motion.div
                                    key={f.text}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.08 }}
                                    className="flex items-center gap-1.5 text-xs text-slate-500 bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] px-3 py-1.5 rounded-full"
                                >
                                    <f.icon className="w-3 h-3" />
                                    {f.text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Contact Info */}
                        <motion.div
                            className="lg:col-span-2 space-y-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.08 }}
                                    className={`group flex items-center gap-4 p-4 bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl hover:border-[hsl(230,10%,22%)] transition-all`}
                                >
                                    <div className={`w-11 h-11 rounded-xl ${info.bg} border ${info.border} flex items-center justify-center shrink-0`}>
                                        <info.icon className={`w-5 h-5 ${info.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                                            {info.label}
                                        </p>
                                        <p className="text-white text-sm mt-0.5 font-medium">{info.value}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Office hours card */}
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45 }}
                                className="p-4 bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl mt-2"
                            >
                                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium mb-3">
                                    Office Hours
                                </p>
                                <div className="space-y-2">
                                    {[
                                        { day: "Mon – Fri", time: "9:00 AM – 6:00 PM" },
                                        { day: "Saturday", time: "10:00 AM – 2:00 PM" },
                                        { day: "Sunday", time: "Closed" },
                                    ].map((h) => (
                                        <div key={h.day} className="flex justify-between text-sm">
                                            <span className="text-slate-400">{h.day}</span>
                                            <span className="text-white font-medium">{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Form */}
                        <motion.div
                            className="lg:col-span-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                                <div className="p-6 md:p-8">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                    Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    value={details.name}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField("name")}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="John Doe"
                                                    className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-500/50 rounded-xl h-11"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                    Email
                                                </label>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    value={details.email}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField("email")}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="you@example.com"
                                                    className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-500/50 rounded-xl h-11"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                Phone <span className="text-slate-600">(optional)</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                name="phone"
                                                value={details.phone}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField("phone")}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="+1 234 567 8900"
                                                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-500/50 rounded-xl h-11"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                Message
                                            </label>
                                            <Textarea
                                                name="message"
                                                value={details.message}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField("message")}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="How can we help you?"
                                                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-500/50 rounded-xl min-h-[140px] resize-none"
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={sendLoading}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-blue-600/20"
                                        >
                                            {sendLoading ? (
                                                <BeatLoader size={8} color="#ffffff" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;
