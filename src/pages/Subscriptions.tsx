import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ChevronDown, Truck, Wallet, Zap, Shield,
  Wrench, Filter, Droplet, Settings, Headphones,
  Calendar, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────── data ────── */
const filterPlans = [
  {
    id: 'quarterly',
    name: 'Quarterly',
    frequency: 'Every 3 months',
    price: 2199,
    perFilter: '~₹157 per filter',
    savings: 'Save 10%',
    highlighted: false,
    features: [
      { text: 'Complete 14-stage filter kit', included: true },
      { text: 'Free doorstep delivery', included: true },
      { text: 'Reminder notifications', included: true },
      { text: 'Easy DIY replacement guide', included: true },
      { text: 'Priority support', included: false },
      { text: 'Free technician visit', included: false },
    ],
  },
  {
    id: 'bi-annual',
    name: 'Bi-Annual',
    frequency: 'Every 6 months',
    price: 3799,
    perFilter: '~₹136 per filter',
    savings: 'Save 15%',
    highlighted: true,
    features: [
      { text: 'Complete 14-stage filter kit', included: true },
      { text: 'Free doorstep delivery', included: true },
      { text: 'Reminder notifications', included: true },
      { text: 'Easy DIY replacement guide', included: true },
      { text: 'Priority support', included: true },
      { text: 'Free technician visit', included: true },
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    frequency: 'Every 12 months',
    price: 6999,
    perFilter: '~₹125 per filter',
    savings: 'Save 20%',
    highlighted: false,
    badge: 'BEST VALUE',
    features: [
      { text: 'Complete 14-stage filter kit (×2)', included: true },
      { text: 'Free doorstep delivery', included: true },
      { text: 'Reminder notifications', included: true },
      { text: 'Easy DIY replacement guide', included: true },
      { text: 'Priority support (24hr response)', included: true },
      { text: 'Free technician visit (×2)', included: true },
      { text: 'Complimentary TDS calibration', included: true },
    ],
  },
];

const amcPlans = [
  {
    id: 'gold',
    name: 'AMC Gold',
    duration: '1 Year',
    price: 5999,
    perMonth: '~₹500/month',
    highlighted: false,
    features: [
      { text: '2 preventive maintenance visits', included: true },
      { text: 'All filter replacements (as needed)', included: true },
      { text: 'Membrane cleaning & check', included: true },
      { text: 'Pump & electrical inspection', included: true },
      { text: 'TDS calibration', included: true },
      { text: 'Priority service (48hr response)', included: true },
      { text: '10% off spare parts', included: true },
      { text: 'Extended warranty', included: false },
    ],
  },
  {
    id: 'platinum',
    name: 'AMC Platinum',
    duration: '2 Years',
    price: 9999,
    perMonth: '~₹417/month',
    highlighted: true,
    badge: 'RECOMMENDED',
    savings: 'Save ₹1,999 vs Gold',
    features: [
      { text: '4 preventive maintenance visits', included: true },
      { text: 'All filter replacements (as needed)', included: true },
      { text: 'Membrane cleaning & check', included: true },
      { text: 'Pump & electrical inspection', included: true },
      { text: 'TDS calibration', included: true },
      { text: 'Priority service (24hr response)', included: true },
      { text: '20% off spare parts', included: true },
      { text: '1-year extended warranty', included: true },
      { text: 'Free emergency visits (2)', included: true },
      { text: 'Annual water quality report', included: true },
    ],
  },
];

const comparisonFeatures = [
  { label: 'Filter Kit Delivered', quarterly: 'Every 3 mo', biAnnual: 'Every 6 mo', annual: 'Every 12 mo' },
  { label: 'Free Delivery', quarterly: true, biAnnual: true, annual: true },
  { label: 'Reminder Notifications', quarterly: true, biAnnual: true, annual: true },
  { label: 'DIY Guide', quarterly: true, biAnnual: true, annual: true },
  { label: 'Priority Support', quarterly: false, biAnnual: true, annual: '24hr' },
  { label: 'Technician Visit', quarterly: false, biAnnual: true, annual: '×2' },
  { label: 'TDS Calibration', quarterly: false, biAnnual: false, annual: true },
];

const benefits = [
  { icon: Truck, color: 'text-[#2EC4B6]', title: 'Never Run Out', text: 'Filters arrive at your doorstep before you need them. No last-minute scrambling.' },
  { icon: Wallet, color: 'text-[#FFD700]', title: 'Save Up to 20%', text: 'Subscription pricing is always better than individual purchases. Plus free delivery.' },
  { icon: Zap, color: 'text-[#D4AF37]', title: 'Skip the Queue', text: 'Subscribers get priority support with guaranteed 24-48 hour response times.' },
  { icon: Shield, color: 'text-[#00B4D8]', title: 'Hassle-Free Maintenance', text: 'Our technicians handle everything. You just enjoy pure, mineral-rich water.' },
];

const howItWorks = [
  { step: '1', title: 'Choose Your Plan', text: 'Select a filter replacement or AMC plan that fits your needs.' },
  { step: '2', title: 'We Monitor Remotely', text: 'Our IoT system tracks filter life and water quality in real-time.' },
  { step: '3', title: 'Automatic Delivery', text: 'Filters or technicians arrive at your door before you need them.' },
  { step: '4', title: 'Enjoy Pure Water', text: 'Relax and enjoy perfectly purified, mineral-rich water every day.' },
];

const faqItems = [
  { q: 'How do I know when to replace my filters?', a: 'Your SWORD purifier\'s TFT display shows real-time filter life percentage. Additionally, our mobile app sends push notifications when any filter reaches 20% life remaining. With a subscription, we automatically ship replacements before they\'re needed.' },
  { q: 'Can I change or cancel my subscription?', a: 'Yes, you can modify, pause, or cancel your subscription anytime from your account dashboard. There are no lock-in periods or cancellation fees.' },
  { q: 'What\'s included in the filter kit?', a: 'The complete 14-stage filter kit includes: PP Cotton Sediment Filter, Activated Carbon Block, TDS Sensors (In/Out), Y Divider service, RO Membrane, NF Membrane, UF Membrane, Active Mineral Cartridge, and all O-rings and fittings.' },
  { q: 'Do I need a technician for filter replacement?', a: 'Most filter replacements are designed for easy DIY with our guided tutorial videos. However, AMC subscribers get complimentary technician visits for hassle-free service.' },
  { q: 'What if my membranes need replacement?', a: 'RO and NF membranes typically last 18-24 months. AMC plans include membrane inspection, cleaning, and replacement when needed. Filter replacement plans cover sediment and carbon filters only — membrane replacements are billed separately or covered under AMC.' },
  { q: 'Is shipping really free?', a: 'Yes, all subscription plans include free doorstep delivery anywhere in India. No minimum order value.' },
];

const coverageItems = [
  { icon: Wrench, label: 'Preventive Maintenance' },
  { icon: Filter, label: 'All Filter Replacements' },
  { icon: Droplet, label: 'Membrane Cleaning' },
  { icon: Zap, label: 'Electrical Inspection' },
  { icon: Settings, label: 'TDS Calibration' },
  { icon: Headphones, label: 'Priority Support' },
];

/* ────── animation ────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export default function Subscriptions() {
  const [activeCategory, setActiveCategory] = useState<'filter' | 'amc'>('filter');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [householdSize, setHouseholdSize] = useState(4);

  const consumptionPerPerson = 3; // liters/day
  const dailyConsumption = householdSize * consumptionPerPerson;
  const yearlyIndividualCost = dailyConsumption * 365 * 0.5; // ₹0.5 per liter individual
  const yearlySubscriptionCost = 6999;
  const yearlySavings = Math.max(0, Math.round(yearlyIndividualCost - yearlySubscriptionCost));

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">

      {/* ══════════════ HERO ══════════════ */}
      <section className="container-sword py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-[0.8rem] text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#A0A0A0]">Subscriptions</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          >
            <h1 className="text-display-lg font-display text-white mb-2">
              Never Worry About Maintenance
            </h1>
            <h1 className="text-display-lg font-display text-[#D4AF37] mb-6">Again.</h1>
            <p className="text-body-lg text-[#A0A0A0] max-w-[540px] mb-8 leading-relaxed">
              Subscribe to filter replacements or AMC and enjoy hassle-free purified water year-round.
              Automatic deliveries. Priority service. Exclusive savings.
            </p>
            <button
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center gap-2"
            >
              View Plans <ArrowRight size={16} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[rgba(212,175,55,0.2)]">
                <Filter size={80} className="text-[#D4AF37]/40" />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                <Shield size={28} className="text-[#D4AF37]" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-[#2EC4B6]" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ CATEGORY TABS ══════════════ */}
      <section id="plans" className="container-sword pb-12">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveCategory('filter')}
            className={cn(
              'px-8 py-4 text-[0.875rem] font-semibold transition-all border',
              activeCategory === 'filter'
                ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                : 'bg-transparent text-white border-[rgba(255,255,255,0.3)] hover:border-[#D4AF37]'
            )}
          >
            Filter Replacement Plans
          </button>
          <button
            onClick={() => setActiveCategory('amc')}
            className={cn(
              'px-8 py-4 text-[0.875rem] font-semibold transition-all border',
              activeCategory === 'amc'
                ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                : 'bg-transparent text-white border-[rgba(255,255,255,0.3)] hover:border-[#D4AF37]'
            )}
          >
            AMC (Annual Maintenance)
          </button>
        </div>
      </section>

      {/* ══════════════ FILTER REPLACEMENT PLANS ══════════════ */}
      <AnimatePresence mode="wait">
        {activeCategory === 'filter' && (
          <motion.section
            key="filter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Plan Cards */}
            <section className="bg-[#111111] py-12 md:py-16">
              <div className="container-sword">
                <div className="text-center mb-10">
                  <h2 className="text-display-lg font-display text-white mb-2">Filter Replacement Plans</h2>
                  <p className="text-[0.875rem] text-[#A0A0A0]">Get fresh filters delivered to your door, automatically</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
                  {filterPlans.map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className={cn(
                        'relative p-6 md:p-8 transition-all duration-300',
                        plan.highlighted
                          ? 'bg-gradient-to-b from-[rgba(212,175,55,0.12)] to-[rgba(212,175,55,0.02)] border-2 border-[#D4AF37]'
                          : 'glass-card hover:border-[rgba(212,175,55,0.3)]'
                      )}
                    >
                      {plan.highlighted && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4AF37] text-[#0A0A0A] text-[0.6rem] font-bold uppercase tracking-[0.08em]">
                          MOST POPULAR
                        </span>
                      )}
                      {plan.badge && !plan.highlighted && (
                        <span className="absolute -top-3 right-4 px-3 py-1 bg-[#2EC4B6] text-[#0A0A0A] text-[0.6rem] font-bold uppercase tracking-[0.08em]">
                          {plan.badge}
                        </span>
                      )}

                      <p className="text-display-md font-display text-white mb-1">{plan.name}</p>
                      <p className="text-label text-[#A0A0A0] mb-5">{plan.frequency}</p>

                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-data-md font-mono text-[#D4AF37]">₹{plan.price.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[0.7rem] text-[#666666] mb-2">{plan.perFilter}</p>
                      <span className="inline-block px-2 py-0.5 bg-[#2EC4B6]/20 text-[#2EC4B6] text-[0.6rem] font-bold uppercase tracking-[0.05em] mb-6">
                        {plan.savings}
                      </span>

                      <ul className="space-y-2.5 mb-8">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-start gap-2 text-[0.8rem]">
                            {f.included ? (
                              <Check size={14} className="text-[#2EC4B6] mt-0.5 flex-shrink-0" />
                            ) : (
                              <X size={14} className="text-[#444444] mt-0.5 flex-shrink-0" />
                            )}
                            <span className={f.included ? 'text-[#A0A0A0]' : 'text-[#444444] line-through'}>{f.text}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={cn(
                          'w-full py-3 text-[0.8rem] font-medium uppercase tracking-[0.05em] transition-all flex items-center justify-center gap-2',
                          plan.highlighted
                            ? 'bg-gradient-gold text-[#0A0A0A] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                            : 'border border-[rgba(255,255,255,0.2)] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        )}
                      >
                        Subscribe
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Comparison Table */}
            <section className="container-sword py-12 md:py-16">
              <h3 className="text-display-md font-display text-white text-center mb-8">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full max-w-[900px] mx-auto">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)]">
                      <th className="text-left text-label text-[#666666] pb-4 pr-4">Feature</th>
                      <th className="text-center text-label text-[#A0A0A0] pb-4 px-4">Quarterly</th>
                      <th className="text-center text-label text-[#D4AF37] pb-4 px-4">Bi-Annual</th>
                      <th className="text-center text-label text-[#A0A0A0] pb-4 px-4">Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row) => (
                      <tr key={row.label} className="border-b border-[rgba(255,255,255,0.04)]">
                        <td className="py-3.5 pr-4 text-[0.8rem] text-white">{row.label}</td>
                        <td className="py-3.5 text-center px-4">
                          {typeof row.quarterly === 'boolean' ? (
                            row.quarterly ? <Check size={14} className="text-[#2EC4B6] mx-auto" /> : <X size={14} className="text-[#444444] mx-auto" />
                          ) : (
                            <span className="text-[0.75rem] text-[#A0A0A0]">{row.quarterly}</span>
                          )}
                        </td>
                        <td className="py-3.5 text-center px-4 bg-[rgba(212,175,55,0.03)]">
                          {typeof row.biAnnual === 'boolean' ? (
                            row.biAnnual ? <Check size={14} className="text-[#2EC4B6] mx-auto" /> : <X size={14} className="text-[#444444] mx-auto" />
                          ) : (
                            <span className="text-[0.75rem] text-[#A0A0A0]">{row.biAnnual}</span>
                          )}
                        </td>
                        <td className="py-3.5 text-center px-4">
                          {typeof row.annual === 'boolean' ? (
                            row.annual ? <Check size={14} className="text-[#2EC4B6] mx-auto" /> : <X size={14} className="text-[#444444] mx-auto" />
                          ) : (
                            <span className="text-[0.75rem] text-[#A0A0A0]">{row.annual}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3.5 pr-4 text-[0.8rem] text-white">Cost per Filter</td>
                      <td className="py-3.5 text-center text-[0.75rem] font-mono text-[#A0A0A0] px-4">₹157</td>
                      <td className="py-3.5 text-center text-[0.75rem] font-mono text-[#D4AF37] px-4 bg-[rgba(212,175,55,0.03)]">₹136</td>
                      <td className="py-3.5 text-center text-[0.75rem] font-mono text-[#A0A0A0] px-4">₹125</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-4 text-[0.8rem] text-white">Total Savings</td>
                      <td className="py-3.5 text-center text-[0.75rem] text-[#A0A0A0] px-4">10%</td>
                      <td className="py-3.5 text-center text-[0.75rem] text-[#D4AF37] px-4 bg-[rgba(212,175,55,0.03)]">15%</td>
                      <td className="py-3.5 text-center text-[0.75rem] text-[#2EC4B6] px-4">20%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Savings Calculator */}
            <section className="container-sword pb-16">
              <div className="glass-panel p-6 md:p-8 max-w-[500px] mx-auto">
                <h3 className="text-display-md font-display text-white mb-4 text-center">Savings Calculator</h3>
                <div className="mb-6">
                  <label className="text-label text-[#666666] mb-3 block text-center">
                    How many people in your household? <span className="text-white ml-1">{householdSize}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[0.65rem] text-[#666666] mt-1">
                    <span>1</span><span>8</span>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-[0.8rem] text-[#A0A0A0]">Estimated consumption: ~{dailyConsumption} liters/day</p>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-[0.8rem]">
                    <span className="text-[#A0A0A0]">Without subscription</span>
                    <span className="text-white font-mono">₹{yearlyIndividualCost.toLocaleString('en-IN')}/year</span>
                  </div>
                  <div className="flex justify-between text-[0.8rem]">
                    <span className="text-[#A0A0A0]">With Annual plan</span>
                    <span className="text-[#D4AF37] font-mono">₹{yearlySubscriptionCost.toLocaleString('en-IN')}/year</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30">
                  <p className="text-[0.75rem] text-[#A0A0A0] mb-1">You save</p>
                  <p className="text-data-sm font-mono text-[#2EC4B6]">₹{yearlySavings.toLocaleString('en-IN')}/year</p>
                </div>
              </div>
            </section>
          </motion.section>
        )}

        {/* ══════════════ AMC PLANS ══════════════ */}
        {activeCategory === 'amc' && (
          <motion.section
            key="amc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="bg-[#0A0A0A] py-12 md:py-16">
              <div className="container-sword">
                <div className="text-center mb-10">
                  <h2 className="text-display-lg font-display text-white mb-2">Annual Maintenance Contracts</h2>
                  <p className="text-[0.875rem] text-[#A0A0A0]">Complete peace of mind with comprehensive coverage</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
                  {amcPlans.map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className={cn(
                        'relative p-6 md:p-8 transition-all duration-300',
                        plan.highlighted
                          ? 'bg-gradient-to-b from-[rgba(212,175,55,0.12)] to-[rgba(212,175,55,0.02)] border-2 border-[#D4AF37]'
                          : 'glass-card hover:border-[rgba(212,175,55,0.3)]'
                      )}
                    >
                      {plan.highlighted && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4AF37] text-[#0A0A0A] text-[0.6rem] font-bold uppercase tracking-[0.08em]">
                          {plan.badge}
                        </span>
                      )}
                      {plan.savings && (
                        <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#2EC4B6]/20 text-[#2EC4B6] text-[0.6rem] font-bold uppercase tracking-[0.05em]">
                          {plan.savings}
                        </span>
                      )}

                      <p className="text-display-md font-display text-white mb-1">{plan.name}</p>
                      <p className="text-label text-[#A0A0A0] mb-5">{plan.duration}</p>

                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-data-md font-mono text-[#D4AF37]">₹{plan.price.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[0.7rem] text-[#666666] mb-6">{plan.perMonth}</p>

                      <ul className="space-y-2.5 mb-8">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-start gap-2 text-[0.8rem]">
                            {f.included ? (
                              <Check size={14} className="text-[#2EC4B6] mt-0.5 flex-shrink-0" />
                            ) : (
                              <X size={14} className="text-[#444444] mt-0.5 flex-shrink-0" />
                            )}
                            <span className={f.included ? 'text-[#A0A0A0]' : 'text-[#444444] line-through'}>{f.text}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={cn(
                          'w-full py-3 text-[0.8rem] font-medium uppercase tracking-[0.05em] transition-all flex items-center justify-center gap-2',
                          plan.highlighted
                            ? 'bg-gradient-gold text-[#0A0A0A] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                            : 'border border-[rgba(255,255,255,0.2)] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        )}
                      >
                        Subscribe
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* What's Covered Grid */}
            <section className="bg-[#111111] py-12 md:py-16">
              <div className="container-sword">
                <h3 className="text-display-md font-display text-white text-center mb-8">What&apos;s Covered</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[700px] mx-auto">
                  {coverageItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className="glass-panel p-5 flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 bg-[rgba(212,175,55,0.1)] flex items-center justify-center mb-3">
                        <item.icon size={22} className="text-[#D4AF37]" />
                      </div>
                      <p className="text-[0.8rem] text-white font-medium">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ══════════════ WHY SUBSCRIBE ══════════════ */}
      <section className="bg-[#111111] py-12 md:py-16">
        <div className="container-sword">
          <h2 className="text-display-md font-display text-white text-center mb-10">Why Subscribe?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-panel p-6 text-center"
              >
                <b.icon size={28} className={cn('mx-auto mb-4', b.color)} />
                <h3 className="text-display-md font-display text-white mb-2" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>{b.title}</h3>
                <p className="text-[0.8rem] text-[#A0A0A0] leading-relaxed">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="bg-[#0A0A0A] py-12 md:py-16">
        <div className="container-sword">
          <h2 className="text-display-md font-display text-white text-center mb-10">How It Works</h2>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block max-w-[900px] mx-auto">
            <div className="relative flex justify-between">
              {/* connecting line */}
              <div className="absolute top-5 left-[12%] right-[12%] h-[2px] bg-[#1A1A1A]">
                <div className="h-full w-full bg-gradient-to-r from-[#D4AF37] via-[#D4AF37] to-[#1A1A1A]" />
              </div>
              {howItWorks.map((step, i) => (
                <div key={step.step} className="relative z-10 flex flex-col items-center text-center max-w-[180px]">
                  <div className="w-10 h-10 bg-[#D4AF37] text-[#0A0A0A] font-bold text-[0.875rem] flex items-center justify-center mb-4">
                    {step.step}
                  </div>
                  <h4 className="text-[0.875rem] text-white font-semibold mb-1">{step.title}</h4>
                  <p className="text-[0.75rem] text-[#A0A0A0] leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden max-w-[400px] mx-auto space-y-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#D4AF37] text-[#0A0A0A] font-bold text-[0.875rem] flex items-center justify-center flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h4 className="text-[0.875rem] text-white font-semibold mb-1">{step.title}</h4>
                  <p className="text-[0.75rem] text-[#A0A0A0] leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section className="bg-[#0A0A0A] py-12 md:py-16">
        <div className="container-sword max-w-[800px]">
          <h2 className="text-display-md font-display text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  'glass-panel transition-all',
                  openFaq === i ? 'border-[rgba(212,175,55,0.2)]' : ''
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[0.875rem] text-white font-medium pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} className="text-[#666666] flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[0.8rem] text-[#A0A0A0] leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section
        className="py-16 md:py-20 border-t border-[rgba(212,175,55,0.2)]"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(0,180,216,0.05) 100%)' }}
      >
        <div className="container-sword text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-display-lg font-display text-white mb-3">
              Ready for Hassle-Free Water?
            </h2>
            <p className="text-body-lg text-[#A0A0A0] mb-8 max-w-[500px] mx-auto">
              Join 2,000+ households who trust SWORD subscriptions
            </p>
            <button
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center gap-2 mb-4"
            >
              Choose Your Plan <ArrowRight size={16} />
            </button>
            <p className="text-[0.8rem] text-[#A0A0A0]">
              Or call us: <span className="text-[#D4AF37]">+91 95377 97597</span>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
