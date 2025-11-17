import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      text: "👋 Hello! How can we help you with your BIM project today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [showFAQ, setShowFAQ] = useState(true);

  // Replace with your actual WhatsApp number (including country code, no + or spaces)
  const whatsappNumber = "8801308230988"; // Updated WhatsApp number

  // Quick Reply Buttons
  const quickReplies = [
    { label: "💼 Our Services", message: "I'd like to know more about your BIM services" },
    { label: "💰 Get Quote", message: "I need a quote for my project" },
    { label: "📞 Contact Info", message: "What's the best way to reach you?" },
    { label: "🕒 Working Hours", message: "What are your business hours?" },
  ];

  // FAQ Database
  const faqs: FAQ[] = [
    {
      question: "What BIM services do you offer?",
      answer: "We offer comprehensive BIM services including:\n\n• 3D BIM Modeling (Architecture, Structure, MEP)\n• Advanced BIM Solutions (Clash Detection, 4D/5D)\n• VDC Services (Construction Planning)\n• Global BIM Coordination\n\nWould you like to discuss a specific service?",
      category: "Services",
    },
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary based on complexity:\n\n• Small projects: 2-4 weeks\n• Medium projects: 1-2 months\n• Large projects: 3-6 months\n\nWe'd be happy to provide a specific timeline after reviewing your project requirements.",
      category: "Timeline",
    },
    {
      question: "What are your working hours?",
      answer: "We're available:\n\n🕐 Monday - Friday: 9:00 AM - 6:00 PM\n🕐 Saturday: 10:00 AM - 4:00 PM\n🕐 Sunday: Closed\n\nFor urgent matters, you can reach us via WhatsApp anytime!",
      category: "Contact",
    },
    {
      question: "Do you work with international clients?",
      answer: "Absolutely! We work with clients globally and have experience delivering projects across multiple time zones. Our team can accommodate your schedule and communication preferences.",
      category: "Services",
    },
  ];

  const handleQuickReply = (quickMessage: string) => {
    setMessage(quickMessage);
    setShowFAQ(false);
  };

  const handleFAQClick = (faq: FAQ) => {
    // Add user question
    setChatMessages((prev) => [
      ...prev,
      { text: faq.question, isBot: false, timestamp: new Date() },
    ]);
    
    // Add bot answer after a short delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { text: faq.answer, isBot: true, timestamp: new Date() },
      ]);
    }, 500);
    
    setShowFAQ(false);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChatMessages((prev) => [
      ...prev,
      { text: message, isBot: false, timestamp: new Date() },
    ]);

    // Check if message matches any FAQ
    const matchedFAQ = faqs.find((faq) =>
      faq.question.toLowerCase().includes(message.toLowerCase()) ||
      message.toLowerCase().includes(faq.question.toLowerCase().split(" ").slice(0, 3).join(" "))
    );

    if (matchedFAQ) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { text: matchedFAQ.answer, isBot: true, timestamp: new Date() },
          {
            text: "Would you like to continue this conversation on WhatsApp? 💬",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }, 800);
    } else {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message! Let me connect you with our team on WhatsApp for a personalized response. 🚀",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }, 600);
    }

    setMessage("");
  };

  const handleContinueOnWhatsApp = () => {
    const chatHistory = chatMessages
      .filter((msg) => !msg.isBot)
      .map((msg) => msg.text)
      .join("\n");
    const encodedMessage = encodeURIComponent(
      chatHistory || "Hi! I'm interested in your BIM services."
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-border w-96 max-h-[600px] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-[#25D366] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="text-[#25D366]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">BIMaided Assistant</h3>
                  <p className="text-xs text-white/90">AI-powered instant answers</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowFAQ(true);
                }}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-line ${
                      msg.isBot
                        ? "bg-white border border-gray-200 text-gray-800"
                        : "bg-[#DCF8C6] text-gray-800"
                    } animate-scale-in`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* FAQ Quick Access */}
              {showFAQ && chatMessages.length <= 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <Sparkles size={14} />
                    Quick answers:
                  </p>
                  {faqs.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-2 bg-white rounded-lg border border-gray-200 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all text-xs"
                    >
                      <span className="font-medium text-gray-700">{faq.question}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reply Buttons */}
            {showFAQ && chatMessages.length <= 1 && (
              <div className="p-3 bg-white border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick replies:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply.message)}
                      className="text-xs p-2 bg-gray-100 hover:bg-[#25D366] hover:text-white rounded-lg transition-all border border-gray-200 hover:border-[#25D366]"
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-4"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </Button>
              </div>

              {/* Continue on WhatsApp Button */}
              {chatMessages.length > 2 && (
                <Button
                  onClick={handleContinueOnWhatsApp}
                  className="w-full mt-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm"
                >
                  <MessageCircle className="mr-2" size={16} />
                  Continue on WhatsApp
                </Button>
              )}

              <p className="text-xs text-gray-500 text-center mt-2">
                Powered by BIMaided AI • Instant responses
              </p>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? (
            <X size={28} />
          ) : (
            <>
              <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default WhatsAppWidget;
