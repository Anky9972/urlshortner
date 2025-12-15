import { Card } from "@/components/ui/card";
import { Link2, BarChart2, QrCode, Layout, Clock, Wand2, Network, HomeIcon } from "lucide-react";

const Features = () => {
  const features = [
    {
      feature: "Instant URL Shortening",
      description: "Convert long URLs into short, easy-to-share links instantly with just a click.",
      icon: Link2,
      color: "cyan"
    },
    {
      feature: "Custom Short URLs",
      description: "Create personalized short URLs that are easy to remember and promote.",
      icon: Wand2,
      color: "violet"
    },
    {
      feature: "Link Analytics",
      description: "Track clicks, geographic location, and referrers to optimize your strategy.",
      icon: BarChart2,
      color: "emerald"
    },
    {
      feature: "QR Code Generation",
      description: "Generate QR codes for your short URLs. Perfect for print media and events.",
      icon: QrCode,
      color: "amber"
    },
    {
      feature: "User-Friendly Dashboard",
      description: "Manage all your shortened URLs in one intuitive dashboard interface.",
      icon: Layout,
      color: "cyan"
    },
    {
      feature: "Link Expiration",
      description: "Set expiration dates for your short URLs for temporary promotions.",
      icon: Clock,
      color: "rose"
    },
    {
      feature: "Link Tree",
      description: "Create a link tree to showcase all your important links in one place.",
      icon: Network,
      color: "violet"
    },
    {
      feature: "Rooms & Invitations",
      description: "Create rooms and invite users to collaborate on projects and share links.",
      icon: HomeIcon,
      color: "emerald"
    }
  ];

  const colorClasses = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="group"
            >
              <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors p-5">
                <div className="flex flex-col space-y-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[f.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {f.feature}
                  </h3>

                  <p className="text-sm text-zinc-500">
                    {f.description}
                  </p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Features;