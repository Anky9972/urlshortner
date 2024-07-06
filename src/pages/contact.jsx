import ConfettiComponent from "@/components/confetti";
import MessageSent from "@/components/message-sent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { BeatLoader } from "react-spinners";

const ContactPage = () => {
  const [messagesent, setMessageSent] = useState(false);
  // const { toast } = useToast();
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sendLoading,setSendLoading] = useState(false);
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
      console.log(json);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  return (
    <>
    {
        messagesent ? 
        (
            <>
            <ConfettiComponent/>
            <MessageSent/>
            </>
        )
        :
        (
            <div className="flex justify-center items-center min-h-screen ">
            <div className="lg:w-11/12 md:p-8 rounded-lg shadow-lg">
              <div className="flex flex-col md:flex-row gap-2 mt-12 lg:mt-0 lg:gap-40 lg:px-10">
                <div className="md:w-1/2 p-4 flex flex-col gap-10">
                  <h1 className="text-3xl font-bold text-[#E9DFCE] mb-4 leading-snug">
                    LET'S TALK ABOUT
                  </h1>
                  <div className="mb-6 flex flex-col gap-5">
                    <p className="text-[#E9DFCE] mb-2 border p-3 rounded-lg flex justify-start items-center gap-2">
                      <FaPhoneAlt /> +1 212 965 9700
                    </p>
                    <p className="text-[#E9DFCE] mb-2 border p-3 rounded-lg flex justify-start items-center gap-2">
                      <FaEnvelope /> Morinfa@creatif.com
                    </p>
                    <p className="text-[#E9DFCE] border p-3 rounded-lg flex justify-start items-start gap-2">
                      <FaMapMarkerAlt />{" "}
                      <span>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-linkedin fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-youtube fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-instagram fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-facebook fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-dribbble fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-twitter fa-2x"></i>
                    </a>
                    <a href="#" className="text-[#E9DFCE]">
                      <i className="fab fa-skype fa-2x"></i>
                    </a>
                  </div>
                </div>
                <div className="md:w-1/2 p-4">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="name" className="block">
                        Name <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        className="block w-full mt-1 p-3 shadow-sm"
                        value={details.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="block w-full mt-1 p-3  shadow-sm"
                        value={details.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="block w-full mt-1 p-3  shadow-sm"
                        value={details.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block">
                        Message <span className="text-red-600">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        rows="4"
                        className="block w-full mt-1 p-2  shadow-sm"
                        value={details.message}
                        onChange={handleChange}
                        required
                      ></Textarea>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="block w-full py-3 px-4 mt-5  font-semibold rounded-md shadow-md "
                      >
                        {sendLoading ? (<BeatLoader color="#020817"/>):'Submit'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
    }
    </>
    
  );
};

export default ContactPage;
