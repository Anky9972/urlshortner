import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      feature: "Instant URL Shortening",
      description: "Convert long URLs into short, easy-to-share links instantly with just a click. Simplify your links and make them more manageable."
    },
    {
      feature: "Custom Short URLs",
      description: "Create personalized short URLs that are easy to remember and promote. Perfect for branding and marketing campaigns."
    },
    {
      feature: "Link Analytics",
      description: "Track the performance of your short URLs with detailed analytics. Get insights into the number of clicks, geographic location, and referrers to optimize your link sharing strategy."
    },
    {
      feature: "QR Code Generation",
      description: "Generate QR codes for your short URLs. Perfect for print media, events, and quick mobile access."
    },
    {
      feature: "User-Friendly Dashboard",
      description: "Manage all your shortened URLs in one place. Our intuitive dashboard makes it easy to track, edit, and organize your links."
    },
    {
      feature: "Link Expiration",
      description: "Set expiration dates for your short URLs to ensure they are only accessible for a limited time. Ideal for temporary promotions and time-sensitive content."
    }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-10 text-center lg:px-28">
      {features.map((f, i) => (
        <Card key={i} className="">
          <CardHeader>
            <CardTitle>{f.feature}</CardTitle>
            <CardDescription>{f.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default Features;
