import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Bot,
  Sparkles,
  ChevronRight,
  Minimize2,
  Lock,
} from 'lucide-react';
import { captureLead } from '@/services/analyticsService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLeadForm?: boolean;
}

interface UserInfo {
  name: string;
  email: string;
}

// ═══════════════════════════════════════════════
// SWORD Knowledge Base for AI Responses
// ═══════════════════════════════════════════════
const SWORD_KNOWLEDGE: Record<string, string> = {
  // Product
  price: 'The SWORD Smart RO Purifier is priced at \u20b927,999 (MRP \u20b934,999). We also offer EMI starting at \u20b92,424/month. Filter replacement kits start at \u20b97,999 and AMC plans from \u20b94,999/year.',
  cost: 'The SWORD Smart RO Purifier is priced at \u20b927,999 (MRP \u20b934,999). We also offer EMI starting at \u20b92,424/month. Filter replacement kits start at \u20b97,999 and AMC plans from \u20b94,999/year.',
  emi: 'We offer No Cost EMI on all major credit cards. You can choose 3, 6, 9, or 12 month tenure. For the SWORD Smart RO at \u20b927,999, your EMI starts at approximately \u20b92,424/month for 12 months at 15% interest.',
  warranty: 'Every SWORD Smart RO comes with a comprehensive 2-year warranty covering all parts and labor. Our Platinum AMC plan extends this by an additional year and includes all filter replacements.',
  guarantee: 'Every SWORD Smart RO comes with a comprehensive 2-year warranty covering all parts and labor. Our Platinum AMC plan extends this by an additional year and includes all filter replacements.',

  // Technology
  technology: 'SWORD uses patented dual-membrane (NF + RO) technology with AI-powered auto-switching. The system intelligently chooses between Nano-Filtration and Reverse Osmosis based on your input water TDS, saving 60% water while retaining essential minerals.',
  membrane: 'SWORD uses patented dual-membrane (NF + RO) technology with AI-powered auto-switching. The system intelligently chooses between Nano-Filtration and Reverse Osmosis based on your input water TDS, saving 60% water while retaining essential minerals.',
  ro: 'Unlike traditional RO that removes everything including beneficial minerals, SWORD Smart RO uses dual-membrane technology. It removes harmful contaminants while retaining 40% of essential Calcium and Magnesium minerals.',
  nf: 'Nano-Filtration (NF) is our proprietary membrane technology that filters out contaminants while selectively retaining essential minerals like Calcium and Magnesium. It operates at lower pressure than RO, saving energy and water.',
  tds: 'SWORD allows you to customize output TDS between 80-300 ppm using the touchscreen display or SWORD app. The AI automatically adjusts the NF/RO ratio to maintain your preferred TDS level regardless of input water quality.',
  mineral: 'SWORD retains 40% of essential minerals (Ca\u00b2\u207a and Mg\u00b2\u207a) through our NF membrane, while traditional RO removes 100% of minerals. This makes SWORD water healthier and better tasting.',
  water: 'SWORD saves up to 60% water compared to traditional RO systems. While conventional RO wastes 4 liters for every 1 liter purified, SWORD wastes only 1.5 liters \u2014 saving approximately 15,000 liters annually per household.',
  saving: 'SWORD saves up to 60% water compared to traditional RO systems. While conventional RO wastes 4 liters for every 1 liter purified, SWORD wastes only 1.5 liters \u2014 saving approximately 15,000 liters annually per household.',

  // Stages
  stages: 'SWORD has a 14-stage purification process: (1) 3-Ball Valve, (2) PP Sediment Filter, (3) TDS Input Sensor, (4) Activated Carbon, (5) Low Pressure Switch, (6) Booster Pump, (7) Smart Y-Divider, (8) Solenoid Valves, (9) RO Membrane, (10) NF Membrane, (11) Water Mixer, (12) Mineral Cartridge, (13) UF Membrane, (14) TDS Output Sensor.',
  purification: 'SWORD has a 14-stage purification process: (1) 3-Ball Valve, (2) PP Sediment Filter, (3) TDS Input Sensor, (4) Activated Carbon, (5) Low Pressure Switch, (6) Booster Pump, (7) Smart Y-Divider, (8) Solenoid Valves, (9) RO Membrane, (10) NF Membrane, (11) Water Mixer, (12) Mineral Cartridge, (13) UF Membrane, (14) TDS Output Sensor.',
  filter: 'SWORD filters include: PP Cotton Sediment Filter (\u20b91,299), Activated Carbon Filter (\u20b91,899), RO Membrane (\u20b93,499), NF Membrane (\u20b94,299), UF Membrane (\u20b92,199), and Mineral Cartridge (\u20b91,599). The complete Filter Replacement Kit is \u20b97,999.',

  // IoT & Smart Features
  app: 'The SWORD mobile app (available on iOS and Android) lets you monitor real-time TDS, track filter life, view water consumption analytics, receive maintenance alerts, and control TDS settings remotely.',
  wifi: 'SWORD connects to your home Wi-Fi (2.4GHz) and syncs with the SWORD app. You can monitor water quality, get filter replacement alerts, and track consumption from anywhere.',
  iot: 'SWORD is a fully IoT-enabled smart purifier. It features a 2.4" TFT touchscreen, Wi-Fi connectivity, mobile app control, real-time TDS monitoring, and predictive maintenance alerts.',
  smart: 'SWORD is a fully IoT-enabled smart purifier. It features a 2.4" TFT touchscreen, Wi-Fi connectivity, mobile app control, real-time TDS monitoring, and predictive maintenance alerts.',

  // Company & Trust
  company: 'SWORD Home Appliances Pvt. Ltd. is an Indian company incorporated in September 2025, incubated at Salford GUIITAR Council and supported by MeitY Startup Hub. Our mission is to provide customized, healthy, mineral-rich drinking water while conserving resources.',
  sword: 'SWORD Home Appliances Pvt. Ltd. is an Indian company incorporated in September 2025, incubated at Salford GUIITAR Council and supported by MeitY Startup Hub. Our mission is to provide customized, healthy, mineral-rich drinking water while conserving resources.',
  indian: 'SWORD is proudly made in India. Our manufacturing facility follows ISO 9001 standards with 47 quality checkpoints. The product is BIS, CE, and RoHS certified.',
  made: 'SWORD is proudly made in India. Our manufacturing facility follows ISO 9001 standards with 47 quality checkpoints. The product is BIS, CE, and RoHS certified.',
  certification: 'SWORD Smart RO is certified by BIS (IS 16240), ISO 9001:2015, CE (European conformity), and RoHS (Restriction of Hazardous Substances). We also have a patent pending for our dual-membrane AI switching technology.',

  // Maintenance
  amc: 'We offer two AMC plans: Gold (\u20b94,999/year) with 2 service visits and 48-hour priority response, and Platinum (\u20b98,999/year) with 4 visits, all filter replacements included, and 24-hour priority support.',
  maintenance: 'Filter replacement is recommended every 6-12 months depending on usage. Our AI system tracks filter life and alerts you via the app when replacement is due. AMC plans cover all maintenance needs.',
  service: 'We provide pan-India service through our authorized network. Service requests are handled within 48 hours for Gold AMC members and 24 hours for Platinum members.',

  // Comparison
  compare: 'SWORD vs Traditional RO: (1) Water Saving: 60% less waste, (2) Mineral Retention: 40% Ca/Mg kept vs 0%, (3) Customizable TDS: 80-300 ppm vs fixed, (4) Smart Features: AI + IoT vs none, (5) Filter Life: 24+ months vs 12 months.',
  difference: 'SWORD vs Traditional RO: (1) Water Saving: 60% less waste, (2) Mineral Retention: 40% Ca/Mg kept vs 0%, (3) Customizable TDS: 80-300 ppm vs fixed, (4) Smart Features: AI + IoT vs none, (5) Filter Life: 24+ months vs 12 months.',

  // Purchase & Shipping
  buy: 'You can buy SWORD Smart RO directly from our website. Click the "Buy Now" button on the product page. We offer free shipping on orders above \u20b920,000, Cash on Delivery, UPI, credit/debit cards, and EMI options.',
  order: 'You can buy SWORD Smart RO directly from our website. Click the "Buy Now" button on the product page. We offer free shipping on orders above \u20b920,000, Cash on Delivery, UPI, credit/debit cards, and EMI options.',
  shipping: 'We offer free shipping on orders above \u20b920,000. Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available for \u20b9149. We deliver across India.',
  delivery: 'We offer free shipping on orders above \u20b920,000. Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available for \u20b9149. We deliver across India.',
  cod: 'Yes, Cash on Delivery (COD) is available for orders up to \u20b950,000. A small COD fee of \u20b949 may apply.',
  return: 'We offer a 10-day return policy. If you are not satisfied, you can return the product in its original condition for a full refund. The product must not be installed or used.',
  refund: 'We offer a 10-day return policy. If you are not satisfied, you can return the product in its original condition for a full refund. The product must not be installed or used.',

  // Contact
  contact: 'You can reach us at: Email: priyank.joshi@swordhome.com, Phone: +91 95377 97597, Address: 36 Uparkot Vistar, Limadhra-1, Junagadh, Gujarat 362120.',
  email: 'You can reach us at: Email: priyank.joshi@swordhome.com, Phone: +91 95377 97597, Address: 36 Uparkot Vistar, Limadhra-1, Junagadh, Gujarat 362120.',
  phone: 'You can reach us at: Email: priyank.joshi@swordhome.com, Phone: +91 95377 97597, Address: 36 Uparkot Vistar, Limadhra-1, Junagadh, Gujarat 362120.',
  address: 'Our office is at: 36 Uparkot Vistar, Limadhra-1, Junagadh, Gujarat 362120. We deliver across all of India.',

  // Default greeting
  hi: 'Hello! Welcome to SWORD Smart Water. I am your AI assistant. Ask me anything about our SWORD Smart RO purifier \u2014 pricing, technology, features, maintenance, or place an order!',
  hello: 'Hello! Welcome to SWORD Smart Water. I am your AI assistant. Ask me anything about our SWORD Smart RO purifier \u2014 pricing, technology, features, maintenance, or place an order!',
  hey: 'Hello! Welcome to SWORD Smart Water. I am your AI assistant. Ask me anything about our SWORD Smart RO purifier \u2014 pricing, technology, features, maintenance, or place an order!',
};

const GENERIC_RESPONSES = [
  "That's a great question about SWORD! To give you the most accurate answer and ensure you get the best guidance, could you share your name, email, and phone number? Our product specialist will personally reach out to assist you within 24 hours.",
  "I'd love to help you with that! For detailed personalized assistance, please share your contact details \u2014 name, email, and phone number \u2014 and our SWORD expert will call you shortly with all the information you need.",
  "Thank you for your interest in SWORD! To provide you with the best possible guidance on this, could you please leave your name, email, and phone number? One of our water purification specialists will contact you directly.",
];

const LOCAL_STORAGE_KEY = 'sword_chat_user';

function findAnswer(input: string): string | null {
  const lower = input.toLowerCase();

  // Direct keyword matching
  for (const [keyword, response] of Object.entries(SWORD_KNOWLEDGE)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }

  // Check for related terms
  if (lower.includes('how much') || lower.includes('rate') || lower.includes('\u20b9') || lower.includes('rs') || lower.includes('rupee')) {
    return SWORD_KNOWLEDGE.price;
  }
  if (lower.includes('install') || lower.includes('setup') || lower.includes('fitting')) {
    return 'Professional installation is included free with every SWORD Smart RO purchase. Our certified technician will visit your home, install the unit, and explain all features. Installation typically takes 45-60 minutes.';
  }
  if (lower.includes('how long') && (lower.includes('filter') || lower.includes('last'))) {
    return SWORD_KNOWLEDGE.filter;
  }
  if (lower.includes('cancel') || lower.includes('stop')) {
    return SWORD_KNOWLEDGE.return;
  }
  if (lower.includes('pay') || lower.includes('payment') || lower.includes('card') || lower.includes('upi')) {
    return 'We accept all payment methods: UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, Wallets, and Cash on Delivery. EMI options are also available starting at \u20b92,424/month.';
  }

  return null;
}

function getGenericResponse(): string {
  return GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)];
}

function loadUserInfo(): UserInfo | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as UserInfo;
  } catch {
    // ignore
  }
  return null;
}

function saveUserInfo(info: UserInfo): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ═══════════════════════════════════════════════
// ChatBot Component
// ═══════════════════════════════════════════════
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(loadUserInfo);
  const [needsContact, setNeedsContact] = useState<boolean>(!loadUserInfo());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize welcome message when contact step is done
  const initChat = useCallback((name: string) => {
    setNeedsContact(false);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${name}! Welcome to SWORD Smart Water. I am your AI assistant. Ask me anything about our purifier \u2014 pricing, technology, features, or maintenance!`,
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleContactSubmit = useCallback(
    (name: string, email: string) => {
      const info: UserInfo = { name: name.trim(), email: email.trim() };
      setUserInfo(info);
      saveUserInfo(info);

      // Capture as lead (phone is empty string per requirements)
      captureLead(info.name, info.email, '', 'chatbot');

      initChat(info.name);
    },
    [initChat]
  );

  const addMessage = (role: ChatMessage['role'], content: string, isLeadForm?: boolean) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg_${Date.now()}`, role, content, timestamp: new Date(), isLeadForm },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const answer = findAnswer(userMessage);

      if (answer) {
        addMessage('assistant', answer);
        setIsTyping(false);
      } else {
        // AI doesn't know \u2014 show lead form
        addMessage('assistant', getGenericResponse());
        setIsTyping(false);
        setTimeout(() => {
          setShowLeadForm(true);
          addMessage('assistant', '', true);
        }, 500);
      }
    }, 800 + Math.random() * 600);
  };

  const handleLeadSubmit = (name: string, email: string, phone: string) => {
    const success = captureLead(name, email, phone, 'chatbot', undefined, window.location.pathname);

    if (success) {
      addMessage(
        'assistant',
        `Thank you ${name}! We have received your details. Our SWORD specialist will contact you within 24 hours at ${phone || email}. Have a great day!`
      );
    } else {
      addMessage(
        'assistant',
        'Sorry, there was an issue saving your details. Please try again or contact us directly at +91 95377 97597.'
      );
    }
    setShowLeadForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = [
    { label: 'Price & EMI', query: 'What is the price?' },
    { label: 'Technology', query: 'How does dual membrane work?' },
    { label: 'Warranty', query: 'What is the warranty?' },
    { label: 'AMC Plans', query: 'Tell me about AMC plans' },
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] text-[#0A0A0A] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.6)] hover:scale-110 transition-all duration-300"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-[#111] border border-white/10 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[#0A0A0A] font-semibold text-sm">SWORD AI Assistant</p>
                  <p className="text-[#0A0A0A]/70 text-[0.625rem]">Online \u2014 Replies instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ═══════ Contact Capture Step ═══════ */}
            <AnimatePresence mode="wait">
              {needsContact ? (
                <motion.div
                  key="contact-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center px-6 py-6"
                >
                  <ContactCaptureForm onSubmit={handleContactSubmit} />
                </motion.div>
              ) : (
                <motion.div
                  key="chat-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                    {messages.map((msg) => (
                      <div key={msg.id}>
                        {msg.role === 'user' ? (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-end"
                          >
                            <div className="bg-[#D4AF37] text-[#0A0A0A] px-4 py-2.5 rounded-tl-xl rounded-bl-xl rounded-br-xl max-w-[85%] text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          </motion.div>
                        ) : msg.isLeadForm ? (
                          <LeadForm
                            onSubmit={handleLeadSubmit}
                            defaultName={userInfo?.name ?? ''}
                            defaultEmail={userInfo?.email ?? ''}
                          />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-2.5"
                          >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center shrink-0 mt-0.5">
                              <Bot size={14} className="text-[#0A0A0A]" />
                            </div>
                            <div className="bg-white/5 border border-white/10 text-white/90 px-4 py-2.5 rounded-tr-xl rounded-br-xl rounded-bl-xl max-w-[85%] text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-[#0A0A0A]" />
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  {!showLeadForm && messages.length < 4 && (
                    <div className="px-4 pb-2 shrink-0">
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((qr) => (
                          <button
                            key={qr.label}
                            onClick={() => {
                              setInput(qr.query);
                              setTimeout(() => handleSend(), 50);
                            }}
                            className="flex items-center gap-1 text-[0.6875rem] bg-white/5 border border-white/10 text-[#D4AF37] px-3 py-1.5 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all"
                          >
                            {qr.label}
                            <ChevronRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="px-4 py-3 border-t border-white/10 shrink-0">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 focus-within:border-[#D4AF37]/50 transition-colors">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about SWORD..."
                        className="flex-1 bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-[#666]"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="w-10 h-10 flex items-center justify-center text-[#D4AF37] hover:text-[#E8D44D] disabled:text-[#444] transition-colors mr-1"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════
// Contact Capture Form (shown BEFORE chat starts)
// ═══════════════════════════════════════════════
function ContactCaptureForm({ onSubmit }: { onSubmit: (name: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email.trim() || !isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Small delay for UX
    setTimeout(() => {
      onSubmit(name.trim(), email.trim());
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-[320px]"
    >
      {/* Greeting */}
      <div className="text-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center"
        >
          <Sparkles size={24} className="text-[#0A0A0A]" />
        </motion.div>
        <h3 className="text-white font-semibold text-lg mb-1">
          Welcome to SWORD Smart Water! 👋
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          Before we start, could you please share your name and email? This helps us assist you better.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your Name *"
              className={`w-full bg-white/5 border text-white text-sm pl-9 pr-3 py-2.5 outline-none transition-colors placeholder:text-[#666] ${
                errors.name
                  ? 'border-red-500/60 focus:border-red-500'
                  : 'border-white/10 focus:border-[#D4AF37]'
              }`}
            />
          </div>
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[0.6875rem] mt-1 ml-1"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="Email Address *"
              className={`w-full bg-white/5 border text-white text-sm pl-9 pr-3 py-2.5 outline-none transition-colors placeholder:text-[#666] ${
                errors.email
                  ? 'border-red-500/60 focus:border-red-500'
                  : 'border-white/10 focus:border-[#D4AF37]'
              }`}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[0.6875rem] mt-1 ml-1"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-[#0A0A0A] font-semibold text-sm py-2.5 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send size={14} />
            {isSubmitting ? 'Starting...' : 'Start Chat'}
          </button>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[0.625rem] text-[#666] text-center flex items-center justify-center gap-1 pt-1"
        >
          <Lock size={10} className="text-[#666]" />
          Your data is secure
        </motion.p>
      </form>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// Lead Capture Form (shown when AI can't answer)
// ═══════════════════════════════════════════════
function LeadForm({
  onSubmit,
  defaultName = '',
  defaultEmail = '',
}: {
  onSubmit: (name: string, email: string, phone: string) => void;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    onSubmit(name.trim(), email.trim(), phone.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex gap-2.5"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 size={14} className="text-[#0A0A0A]" />
        </div>
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl max-w-[85%] text-sm">
          Your details have been saved! Our team will contact you within 24 hours.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 p-4 mx-0"
    >
      <p className="text-[#D4AF37] text-sm font-medium mb-3 flex items-center gap-2">
        <User size={14} />
        Leave your details for a callback
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name *"
            required
            className="w-full bg-white/5 border border-white/10 text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-[#666]"
          />
        </div>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address *"
            required
            className="w-full bg-white/5 border border-white/10 text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-[#666]"
          />
        </div>
        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number *"
            required
            className="w-full bg-white/5 border border-white/10 text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-[#666]"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-[#0A0A0A] font-semibold text-sm py-2.5 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <Send size={14} />
          Request Callback
        </button>
        <p className="text-[0.625rem] text-[#666] text-center">
          Your data is secure. We never share your information.
        </p>
      </form>
    </motion.div>
  );
}
