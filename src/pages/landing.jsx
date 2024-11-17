import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import Features from "@/components/features";


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
    <div className="flex flex-col items-center gap-10">
      <h2 className=" my-10 sm:mh-16 text-3xl sm:text-6xl lg:text-7xl text-white text-center font-extrabold">
        The only URL Shortener <br /> you&rsquo;ll ever need!
      </h2>
      <form
        onSubmit={handleShorten}
        className="sm:h-14 flex flex-col sm:flex-row w-full md:w-2/4 gap-2"
      >
        <Input
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter your url"
          className="h-full flex-1 py-4 px-4"
        />
        
        <Button className="h-full" type="submit">
          Shorten!
        </Button>
      </form>
      <Features/>
      <div className="flex flex-col justify-center items-center w-full lg:px-20">
        <h1 className="text-4xl font-bold">FAQs</h1>
      <Accordion type="multiple" collapsible="true" className="w-full md:px-11 ">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
        </div>
    </div>
  );
};

export default LandingPage;
