import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronUp,
  Link2,
  BarChart3,
  QrCode,
  Shield,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  Globe,
  Users,
  Smartphone,
  MousePointerClick,
  Share2,
  Lock,
  Layers,
  Network,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOMetadata } from "@/components/seo-metadata";
import UrlShortener from "@/components/url-shortner";
import { UrlState } from "@/context";

// Features for main grid
const features = [
  {
    icon: Link2,
    title: "Smart URL Shortening",
    description: "Create concise, memorable links with custom slugs and branding.",
    accent: "cyan"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track clicks, locations, devices, and browsers in real-time.",
    accent: "violet"
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    description: "Generate customizable QR codes for offline marketing.",
    accent: "cyan"
  },
  {
    icon: Target,
    title: "Geo & Device Targeting",
    description: "Redirect users based on country, device, or browser.",
    accent: "violet"
  },
  {
    icon: Shield,
    title: "Password Protection",
    description: "Secure sensitive links with access controls.",
    accent: "cyan"
  },
  {
    icon: Clock,
    title: "Link Scheduling",
    description: "Set activation and expiration times for campaigns.",
    accent: "violet"
  }
];

// How it works steps
const howItWorks = [
  {
    step: "01",
    title: "Paste Your Link",
    description: "Enter any long URL you want to shorten. We support all websites and services."
  },
  {
    step: "02",
    title: "Customize It",
    description: "Add a custom alias, set expiration dates, or enable password protection."
  },
  {
    step: "03",
    title: "Share Everywhere",
    description: "Use your short link on social media, emails, or print materials."
  },
  {
    step: "04",
    title: "Track Results",
    description: "Monitor clicks, locations, and devices with our analytics dashboard."
  }
];

// Detailed product features
const productFeatures = [
  {
    icon: MousePointerClick,
    title: "Click Tracking",
    description: "Monitor every click with detailed timestamps, unique vs repeat visitors, and referrer sources.",
    features: ["Real-time updates", "Historical data", "Export reports"]
  },
  {
    icon: Globe,
    title: "Geographic Analytics",
    description: "See where your audience is located with country, city, and region breakdowns.",
    features: ["Interactive maps", "Country filtering", "Region comparison"]
  },
  {
    icon: Smartphone,
    title: "Device Detection",
    description: "Understand what devices your audience uses - mobile, tablet, or desktop.",
    features: ["Browser stats", "OS breakdown", "Device types"]
  },
  {
    icon: Share2,
    title: "Social Integration",
    description: "Share your links directly to social platforms with one click.",
    features: ["Twitter", "LinkedIn", "Facebook", "WhatsApp"]
  }
];

// Use cases
const useCases = [
  {
    title: "Marketers",
    description: "Track campaign performance across channels with UTM parameters and detailed analytics.",
    icon: BarChart3
  },
  {
    title: "Developers",
    description: "API access for programmatic link creation and management in your applications.",
    icon: Layers
  },
  {
    title: "Small Business",
    description: "Professional short links for social media, business cards, and marketing materials.",
    icon: Users
  },
  {
    title: "Content Creators",
    description: "Create bio links and track which content drives the most engagement.",
    icon: Network
  }
];

// Additional features list
const moreFeatures = [
  { icon: Lock, text: "Password Protection" },
  { icon: Clock, text: "Expiration Dates" },
  { icon: Target, text: "Geo Targeting" },
  { icon: QrCode, text: "Dynamic QR Codes" },
  { icon: Layers, text: "Folder Organization" },
  { icon: Network, text: "LinkTree Builder" },
  { icon: Users, text: "Team Collaboration (Rooms)" },
  { icon: Zap, text: "API Integration" }
];

const stats = [
  { value: "10M+", label: "Links Created" },
  { value: "500M+", label: "Clicks Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" }
];

const faqs = [
  {
    question: "How long does a short URL last?",
    answer: "By default, short URLs do not expire. However, you can set an expiration date if desired, or configure click limits."
  },
  {
    question: "Can I track the performance of my short URLs?",
    answer: "Yes! You can track clicks, geographic locations, devices, browsers, referrers, and peak hours with our detailed analytics dashboard."
  },
  {
    question: "Is there a limit to the number of URLs I can shorten?",
    answer: "There is no limit for registered users. Free users might have a daily limit to prevent abuse."
  },
  {
    question: "What is geo-targeting and how does it work?",
    answer: "Geo-targeting allows you to redirect visitors to different URLs based on their country. For example, redirect US visitors to amazon.com and UK visitors to amazon.co.uk."
  },
  {
    question: "Can I password protect my links?",
    answer: "Absolutely! You can add password protection to any link. Visitors will need to enter the correct password before being redirected."
  },
  {
    question: "What is LinkTree and how do I use it?",
    answer: "LinkTree is a feature that lets you create a single page with multiple links - perfect for social media bios. You can customize the design and track all clicks."
  },
  {
    question: "Can I use custom domains?",
    answer: "Yes, you can use your own domain for branded short links. This helps with brand recognition and trust."
  }
];

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user } = UrlState();
  const navigate = useNavigate();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) navigate(`/auth?createNew=${longUrl}`);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SEOMetadata
        title="TrimLink - Modern URL Shortener with Advanced Analytics"
        description="Create short links, QR Codes, and Link-in-bio pages. Track links with powerful analytics, geo-targeting, and password protection."
        canonical="https://trimlynk.com"
        keywords="url shortener, link management, QR codes, link analytics, link tree, geo targeting, password protection"
        author="TrimLink"
        language="en"
      />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 bg-hero-glow">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Now with Geo-Targeting & Analytics</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
          >
            The only URL shortener
            <br />
            <span className="text-gradient">you'll ever need</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10"
          >
            Create smart short links with advanced analytics, geo-targeting,
            password protection, and beautiful QR codes — all in one platform.
          </motion.p>

          {/* URL Shortener Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            {user ? (
              <form onSubmit={handleShorten}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="Paste your long URL here..."
                    className="h-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold"
                  >
                    Shorten
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            ) : (
              <UrlShortener />
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-cyan mb-4 inline-block">Simple & Fast</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get started in seconds. No technical knowledge required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-full hover:border-zinc-700 transition-colors">
                  <span className="text-5xl font-bold text-zinc-800">{item.step}</span>
                  <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {item.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-zinc-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section className="py-24 px-4 bg-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-violet mb-4 inline-block">Powerful Features</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to manage links
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Powerful features designed for marketers, developers, and businesses of all sizes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`card-clean-hover p-6 ${feature.accent === 'cyan' ? 'hover:border-cyan-500/30' : 'hover:border-violet-500/30'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.accent === 'cyan' ? 'bg-cyan-500/10' : 'bg-violet-500/10'
                  }`}>
                  <feature.icon className={`w-5 h-5 ${feature.accent === 'cyan' ? 'text-cyan-400' : 'text-violet-400'
                    }`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT FEATURES DETAILED ==================== */}
      <section className="py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-emerald mb-4 inline-block">Analytics & Insights</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Deep Analytics for Every Link
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Understand your audience with comprehensive click analytics and insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.features.map((f, i) => (
                        <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== USE CASES ==================== */}
      <section className="py-24 px-4 bg-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-amber mb-4 inline-block">Use Cases</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Everyone
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Whether you're a marketer, developer, or small business owner, TrimLink has you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MORE FEATURES LIST ==================== */}
      <section className="py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              And So Much More...
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {moreFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="text-sm text-zinc-300">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 px-4 bg-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="card-elevated p-12 text-center relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to supercharge your links?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of marketers and businesses using TrimLink to create,
                track, and optimize their links.
              </p>

              {/* Benefits list */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["Free to start", "No credit card", "Instant setup"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/auth')}
                  className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="h-12 px-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section className="py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <Accordion type="multiple" className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="card-clean border-zinc-800 px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-5">
                    <span className="text-left text-white font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full border border-zinc-700 transition-all hover:scale-110 z-50"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default LandingPage;
