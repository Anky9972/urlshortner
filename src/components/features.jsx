import {
  Card,
} from "@/components/ui/card";
import { Link2, BarChart2, QrCode, Layout, Clock, Wand2 } from "lucide-react";

const Features = () => {
  const features = [
    {
      feature: "Instant URL Shortening",
      description: "Convert long URLs into short, easy-to-share links instantly with just a click.",
      icon: Link2
    },
    {
      feature: "Custom Short URLs",
      description: "Create personalized short URLs that are easy to remember and promote.",
      icon: Wand2
    },
    {
      feature: "Link Analytics",
      description: "Track clicks, geographic location, and referrers to optimize your strategy.",
      icon: BarChart2
    },
    {
      feature: "QR Code Generation",
      description: "Generate QR codes for your short URLs. Perfect for print media and events.",
      icon: QrCode
    },
    {
      feature: "User-Friendly Dashboard",
      description: "Manage all your shortened URLs in one intuitive dashboard interface.",
      icon: Layout
    },
    {
      feature: "Link Expiration",
      description: "Set expiration dates for your short URLs for temporary promotions.",
      icon: Clock
    }
  ];

  return (
    <div className=" p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group animate-fade-up"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 transform transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                  
                  <div className="relative bg-gray-900/95 h-full p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 transform transition-transform duration-500 hover:rotate-180">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white">
                        {f.feature}
                      </h3>
                      
                      <p className="text-gray-400">
                        {f.description}
                      </p>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 delay-100" />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          opacity: 0;
          animation: fade-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Features;