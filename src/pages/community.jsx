import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Github,
  Twitter,
  MessageSquare,
  Heart,
  Star,
  GitPullRequest,
  Bug,
  Lightbulb,
  BookOpen,
  Code2,
  ExternalLink,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Mail,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Loader2,
} from 'lucide-react';
import { SEOMetadata } from '@/components/seo-metadata';
import { UrlState } from '@/context';
import DiscussionBoard from '@/components/discussion-board';

/* ═══════════════ CONFIG ═══════════════ */
const GITHUB_OWNER = 'Anky9972';
const GITHUB_REPO_NAME = 'urlshortner';
const GITHUB_REPO = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}`;
const GITHUB_PROFILE = `https://github.com/${GITHUB_OWNER}`;
const TWITTER_URL = 'https://x.com/anky_vivek';
const CONTACT_EMAIL = 'ankygaur9972@gmail.com';

/* ═══════════════ CONTRIBUTION WAYS ═══════════════ */
const contributionWays = [
  {
    icon: Bug,
    title: 'Report Bugs',
    description: 'Found a bug? Help us improve by reporting it on GitHub Issues with detailed steps to reproduce.',
    link: `${GITHUB_REPO}/issues/new?labels=bug&title=Bug%3A+`,
    linkText: 'Report a Bug',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    icon: Lightbulb,
    title: 'Request Features',
    description: 'Have an idea for a new feature? Share it with us and the community will discuss and vote.',
    link: `${GITHUB_REPO}/issues/new?labels=enhancement&title=Feature%3A+`,
    linkText: 'Suggest Feature',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: GitPullRequest,
    title: 'Submit PRs',
    description: 'Contribute code directly. Fix bugs, add features, or improve documentation through pull requests.',
    link: `${GITHUB_REPO}/pulls`,
    linkText: 'Open a PR',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: BookOpen,
    title: 'Improve Docs',
    description: 'Help others by improving documentation, writing guides, or creating tutorials for TrimLink.',
    link: `${GITHUB_REPO}/tree/main/README.md`,
    linkText: 'Edit Docs',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Star,
    title: 'Star & Share',
    description: 'Support us by starring the repo on GitHub and sharing TrimLink with your developer friends.',
    link: GITHUB_REPO,
    linkText: 'Star on GitHub',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Join Discussions',
    description: 'Participate in GitHub Discussions. Ask questions, share tips, and connect with other users.',
    link: `${GITHUB_REPO}/issues`,
    linkText: 'Join Discussion',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
];

/* ═══════════════ SOCIAL LINKS ═══════════════ */
const socialLinks = [
  {
    icon: Github,
    label: 'GitHub',
    description: 'Source code, issues & pull requests',
    url: GITHUB_REPO,
    color: 'text-white',
    bg: 'bg-[hsl(230,10%,12%)]',
    hoverBg: 'hover:bg-[hsl(230,10%,16%)]',
    border: 'border-[hsl(230,10%,20%)]',
  },
  {
    icon: Twitter,
    label: 'Twitter / X',
    description: 'Updates, tips & announcements',
    url: TWITTER_URL,
    color: 'text-sky-400',
    bg: 'bg-sky-500/5',
    hoverBg: 'hover:bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    icon: Mail,
    label: 'Email',
    description: 'Direct support & partnership inquiries',
    url: `mailto:${CONTACT_EMAIL}`,
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    hoverBg: 'hover:bg-blue-500/10',
    border: 'border-blue-500/20',
  },
];

/* ═══════════════ GETTING STARTED STEPS ═══════════════ */
const gettingStartedSteps = [
  {
    step: 1,
    title: 'Fork the Repository',
    description: 'Start by forking the TrimLink repository to your own GitHub account.',
    code: `git clone https://github.com/YOUR_USERNAME/urlshortner.git`,
  },
  {
    step: 2,
    title: 'Install Dependencies',
    description: 'Navigate into the project and install all required packages.',
    code: `cd urlshortner && npm install`,
  },
  {
    step: 3,
    title: 'Set Up Environment',
    description: 'Copy the example environment file and add your config values.',
    code: `cp .env.example .env`,
  },
  {
    step: 4,
    title: 'Start Development',
    description: 'Run the development server and start building!',
    code: `npm run dev`,
  },
];

/* ═══════════════ FAQ ═══════════════ */
const faqItems = [
  {
    question: 'How can I contribute to TrimLink?',
    answer: 'You can contribute by reporting bugs, suggesting features, submitting pull requests, improving documentation, or simply starring the repo on GitHub. Check our contribution guide in the repository for detailed instructions.',
  },
  {
    question: 'Do I need permission to contribute?',
    answer: 'No! TrimLink is open source. Anyone can fork the repo, make changes, and submit a pull request. We review all PRs and provide feedback.',
  },
  {
    question: 'What tech stack does TrimLink use?',
    answer: 'TrimLink is built with React + Vite on the frontend, Express.js on the backend, Prisma ORM with PostgreSQL for the database, and Tailwind CSS for styling.',
  },
  {
    question: 'How do I report a security vulnerability?',
    answer: `Please do not open a public issue for security vulnerabilities. Instead, email us directly at ${CONTACT_EMAIL} with details of the vulnerability.`,
  },
  {
    question: 'Can I use TrimLink for my own project?',
    answer: 'Yes! TrimLink is open source. You can fork it, customize it, and deploy it for your own use. Please check the license in the repository for details.',
  },
];

/* ═══════════════ GUIDELINES ═══════════════ */
const guidelines = [
  { icon: Heart, text: 'Be respectful and inclusive to all community members' },
  { icon: Shield, text: 'Follow our code of conduct in all interactions' },
  { icon: Code2, text: 'Write clean, well-documented code with tests' },
  { icon: MessageSquare, text: 'Provide constructive feedback on pull requests' },
  { icon: Globe, text: 'Help translate and make TrimLink accessible globally' },
  { icon: Zap, text: 'Focus on performance and user experience improvements' },
];

/* ─── Reusable code snippet block ─── */
function CodeSnippet({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group mt-2">
      <pre className="bg-[hsl(230,15%,8%)] border border-[hsl(230,10%,18%)] rounded-xl px-4 py-3 text-sm text-slate-300 font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,22%)] text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-[hsl(230,10%,15%)] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[hsl(230,10%,10%)] transition-colors"
      >
        <span className="text-sm font-medium text-white pr-4">{item.question}</span>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        }
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  COMMUNITY  PAGE                       */
/* ═══════════════════════════════════════ */
export default function CommunityPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [ghStats, setGhStats] = useState({ stars: null, forks: null, openIssues: null, contributors: null, loading: true });
  const { user } = UrlState();

  /* Fetch live stats from GitHub public API (no auth needed, 60 req/hr) */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const [repoRes, contribRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}`, { signal: controller.signal }),
          fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/contributors?per_page=1&anon=true`, { signal: controller.signal }),
        ]);

        const repo = await repoRes.json();

        // GitHub returns contributor count via Link header pagination
        let contributorCount = 0;
        const linkHeader = contribRes.headers.get('Link');
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
          contributorCount = match ? parseInt(match[1], 10) : 1;
        } else {
          const contribData = await contribRes.json();
          contributorCount = Array.isArray(contribData) ? contribData.length : 0;
        }

        setGhStats({
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          openIssues: repo.open_issues_count ?? 0,
          contributors: contributorCount,
          loading: false,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('GitHub API fetch failed:', err);
          setGhStats(prev => ({ ...prev, loading: false }));
        }
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <>
      <SEOMetadata
        title="Community | TrimLink"
        description="Join the TrimLink open-source community. Contribute code, report bugs, suggest features, and connect with developers building the modern URL shortener."
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/community`}
        keywords="TrimLink community, open source, contribute, GitHub, developers"
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative">
          {/* ═══════ HERO ═══════ */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/10 border border-violet-500/20 mb-6"
            >
              <Users className="w-8 h-8 text-violet-400" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Community
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              TrimLink is open source and built by developers like you. Join our growing community to contribute, connect, and shape the future of link management.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-100 transition-all hover:shadow-lg hover:shadow-white/10"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,20%)] text-white font-semibold rounded-xl hover:bg-[hsl(230,10%,16%)] transition-all"
              >
                <Twitter className="w-5 h-5" />
                Follow on X
              </a>
            </div>
          </motion.div>

          {/* ═══════ COMMUNITY STATS (LIVE) ═══════ */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {[
              { label: 'GitHub Stars', icon: Star, value: ghStats.stars, color: 'text-yellow-400', border: 'border-yellow-500/20', link: GITHUB_REPO },
              { label: 'Contributors', icon: Users, value: ghStats.contributors, color: 'text-emerald-400', border: 'border-emerald-500/20', link: `${GITHUB_REPO}/graphs/contributors` },
              { label: 'Open Issues', icon: Bug, value: ghStats.openIssues, color: 'text-red-400', border: 'border-red-500/20', link: `${GITHUB_REPO}/issues` },
              { label: 'Forks', icon: GitPullRequest, value: ghStats.forks, color: 'text-violet-400', border: 'border-violet-500/20', link: `${GITHUB_REPO}/fork` },
            ].map((stat) => (
              <a
                key={stat.label}
                href={stat.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-5 text-center hover:${stat.border} transition-all hover:bg-[hsl(230,10%,11%)]`}
              >
                <stat.icon className={`w-7 h-7 ${stat.color} mx-auto mb-2`} />
                {ghStats.loading ? (
                  <Loader2 className="w-5 h-5 text-slate-600 mx-auto animate-spin mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-white mb-1">{stat.value ?? '—'}</p>
                )}
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </a>
            ))}
          </motion.div>

          {/* ═══════ WAYS TO CONTRIBUTE ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ways to Contribute</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Every contribution makes a difference. Here's how you can help improve TrimLink.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributionWays.map((way, i) => (
                <motion.a
                  key={way.title}
                  href={way.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className={`group relative ${way.bg} border ${way.border} rounded-2xl p-6 hover:scale-[1.02] transition-all`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${way.bg} border ${way.border} mb-4`}>
                    <way.icon className={`w-5 h-5 ${way.color}`} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{way.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{way.description}</p>
                  <span className={`text-sm font-medium ${way.color} group-hover:underline inline-flex items-center gap-1`}>
                    {way.linkText} <ExternalLink className="w-3 h-3" />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* ═══════ CONNECT WITH US ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Connect With Us</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Stay up to date and engage with the TrimLink community across platforms.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group ${social.bg} border ${social.border} ${social.hoverBg} rounded-2xl p-6 text-center transition-all hover:scale-[1.02]`}
                >
                  <social.icon className={`w-8 h-8 ${social.color} mx-auto mb-3`} />
                  <h3 className="text-white font-semibold mb-1">{social.label}</h3>
                  <p className="text-xs text-slate-500">{social.description}</p>
                </a>
              ))}
            </div>
          </motion.section>

          {/* ═══════ DISCUSSION BOARD ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            id="discussions"
          >
            <div className="bg-[hsl(230,10%,7%)] border border-[hsl(230,10%,13%)] rounded-2xl p-6 md:p-8">
              <DiscussionBoard user={user} />
            </div>
          </motion.section>

          {/* ═══════ COMMUNITY GUIDELINES ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Community Guidelines</h2>
                <p className="text-slate-400 text-sm">
                  Help us keep TrimLink a welcoming space for everyone.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guidelines.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(230,10%,7%)] border border-[hsl(230,10%,13%)]"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <g.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-300 leading-relaxed">{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══════ GET STARTED ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Getting Started</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Set up your local development environment in a few simple steps.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {gettingStartedSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400">
                      {s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                      <p className="text-sm text-slate-400 mb-2">{s.description}</p>
                      <CodeSnippet code={s.code} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ TECH STACK ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Tech Stack</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Built with modern, battle-tested technologies.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { name: 'React', desc: 'UI Framework' },
                { name: 'Vite', desc: 'Build Tool' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'Framer Motion', desc: 'Animations' },
                { name: 'Express.js', desc: 'Backend' },
                { name: 'Prisma', desc: 'ORM' },
                { name: 'PostgreSQL', desc: 'Database' },
                { name: 'shadcn/ui', desc: 'Components' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-xl p-4 text-center hover:border-blue-500/20 transition-colors"
                >
                  <p className="text-sm font-semibold text-white">{tech.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tech.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ FAQ ═══════ */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">FAQ</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Common questions about contributing and the community.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              {faqItems.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </motion.section>

          {/* ═══════ CTA ═══════ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-emerald-600/5 border border-[hsl(230,10%,15%)] rounded-2xl p-10 md:p-14 text-center overflow-hidden">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

              <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to Make an Impact?
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Whether you&apos;re fixing a typo or building a major feature, every contribution is valued. Let&apos;s build something amazing together.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`${GITHUB_REPO}/fork`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/25"
                >
                  <GitPullRequest className="w-5 h-5" />
                  Fork & Contribute
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,20%)] text-white font-semibold rounded-xl hover:bg-[hsl(230,10%,16%)] transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Get in Touch
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
