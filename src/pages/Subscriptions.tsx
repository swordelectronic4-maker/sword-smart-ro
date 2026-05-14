import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Droplets, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'basic',
    name: 'Basic Care',
    price: 2999,
    period: 'year',
    icon: Droplets,
    features: [
      '2 Preventive Maintenance Visits',
      'Sediment Filter Replacement',
      'Carbon Filter Replacement',
      'Basic Cleaning & Sanitization',
      'Email Support',
    ],
    notIncluded: ['RO/NF Membrane Replacement', 'Priority Service', 'Annual Filter Kit'],
    highlighted: false,
  },
  {
    id: 'gold',
    name: 'Gold Care',
    price: 4999,
    period: 'year',
    icon: Calendar,
    features: [
      '3 Preventive Maintenance Visits',
      'All Filter Replacements',
      'Deep Cleaning & Sanitization',
      'TDS Calibration Check',
      'Priority Service (48h)',
      '6-Month Warranty Extension',
    ],
    notIncluded: ['RO/NF Membrane Replacement'],
    highlighted: true,
  },
  {
    id: 'platinum',
    name: 'Platinum Care',
    price: 8999,
    period: 'year',
    icon: ShieldCheck,
    features: [
      '4 Preventive Maintenance Visits',
      'Complete Filter Replacement Kit',
      'RO + NF Membrane Replacement',
      'Deep Cleaning & Sanitization',
      'VIP Priority Service (24h)',
      '12-Month Warranty Extension',
      'Dedicated Support Line',
    ],
    notIncluded: [],
    highlighted: false,
  },
];

export default function Subscriptions() {
  const [selectedPlan, setSelectedPlan] = useState('gold');

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        <div className="text-center mb-12">
          <span className="text-label text-[#D4AF37] mb-3 block">SUBSCRIPTION PLANS</span>
          <h1 className="text-display-lg font-display text-white mb-3">
            Protect Your Investment
          </h1>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            Regular maintenance ensures optimal performance and extends the life of your SWORD purifier. Choose a plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative p-6 transition-all duration-300',
                plan.highlighted
                  ? 'bg-gradient-to-b from-[rgba(212,175,55,0.15)] to-[rgba(212,175,55,0.02)] border-2 border-[#D4AF37]'
                  : 'glass-card hover:border-[rgba(212,175,55,0.3)]'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4AF37] text-[#0A0A0A] text-[0.65rem] font-medium uppercase tracking-[0.05em]">
                  Most Popular
                </span>
              )}
              <plan.icon size={28} className={plan.highlighted ? 'text-[#D4AF37]' : 'text-[#A0A0A0]'} />
              <h3 className="text-display-md font-display text-white mt-4 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-data-lg font-mono text-[#D4AF37]">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-[0.75rem] text-[#A0A0A0]">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[0.875rem] text-[#A0A0A0]">
                    <Check size={14} className="text-[#2EC4B6] mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[0.875rem] text-[#444444] line-through">
                    <Check size={14} className="text-[#333333] mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  'w-full py-3 text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-all flex items-center justify-center gap-2',
                  selectedPlan === plan.id
                    ? 'bg-gradient-gold text-[#0A0A0A]'
                    : 'border border-[rgba(255,255,255,0.2)] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'
                )}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                {selectedPlan === plan.id && <ArrowRight size={14} />}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Browse All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
