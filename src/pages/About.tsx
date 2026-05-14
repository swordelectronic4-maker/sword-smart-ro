import { Award, Users, Factory, Globe } from 'lucide-react';

const stats = [
  { icon: Users, value: '50,000+', label: 'Happy Customers' },
  { icon: Factory, value: '12', label: 'Years of Excellence' },
  { icon: Award, value: '14', label: 'Stage Purification' },
  { icon: Globe, value: '25+', label: 'Cities Covered' },
];

const milestones = [
  { year: '2013', title: 'Founded', desc: 'SWORD Home Appliances Pvt. Ltd. established in Mumbai' },
  { year: '2016', title: 'First Patent', desc: 'Filed patent for dual-membrane NF+RO technology' },
  { year: '2019', title: 'Product Launch', desc: 'Launched SWORD Smart RO with AI-powered switching' },
  { year: '2022', title: 'IoT Platform', desc: 'Released SWORD mobile app for remote monitoring' },
  { year: '2025', title: 'Pan-India', desc: 'Serving 50,000+ households across 25+ cities' },
];

export default function About() {
  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      {/* Hero */}
      <div className="relative py-20 md:py-32 overflow-hidden">
        <img
          src="/lifestyle-kitchen.jpg"
          alt="SWORD in a premium Indian home"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[rgba(10,10,10,0.7)] to-[#0A0A0A]" />
        <div className="container-sword relative z-10 text-center">
          <span className="text-label text-[#D4AF37] mb-4 block">ABOUT SWORD</span>
          <h1 className="text-display-lg font-display text-white mb-4 max-w-[700px] mx-auto">
            Engineering the Future of Water Purification
          </h1>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            From a small workshop in Mumbai to India&apos;s most advanced water purification technology,
            SWORD has always been driven by one mission: pure water, preserved minerals, zero waste.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container-sword pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel p-6 text-center">
              <stat.icon size={24} className="text-[#D4AF37] mx-auto mb-3" />
              <p className="text-data-md font-mono text-white mb-1">{stat.value}</p>
              <p className="text-[0.75rem] text-[#A0A0A0] uppercase tracking-[0.05em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="container-sword py-16 border-t border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-label text-[#D4AF37] mb-4 block">OUR STORY</span>
            <h2 className="text-display-md font-display text-white mb-4">
              Born from Necessity, Built for India
            </h2>
            <div className="space-y-4 text-[0.875rem] text-[#A0A0A0] leading-relaxed">
              <p>
                In 2013, our founder Priyank Joshi watched his mother struggle with water quality
                issues despite having a premium RO purifier. The water was pure, yes — but it had
                stripped away every essential mineral. That&apos;s when the idea of SWORD was born.
              </p>
              <p>
                After 6 years of R&D, countless prototypes, and extensive field testing across India&apos;s
                diverse water conditions, we launched the SWORD Smart RO — the country&apos;s first
                dual-membrane purifier that combines NF and RO technologies with AI-powered switching.
              </p>
              <p>
                Today, SWORD is trusted by over 50,000 households across 25+ cities. Our technology
                saves 60% more water than traditional RO systems while retaining essential calcium
                and magnesium minerals that your family needs.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="/hero-bg.jpg"
              alt="SWORD manufacturing"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-50" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container-sword py-16 border-t border-[rgba(255,255,255,0.06)]">
        <span className="text-label text-[#D4AF37] mb-8 block text-center">OUR JOURNEY</span>
        <div className="max-w-[800px] mx-auto">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex gap-6 mb-8 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-[#D4AF37]" />
                {i < milestones.length - 1 && <div className="w-[1px] h-full bg-[rgba(255,255,255,0.1)]" />}
              </div>
              <div className="pb-8">
                <span className="text-data-sm font-mono text-[#D4AF37]">{m.year}</span>
                <h3 className="text-[1.125rem] font-medium text-white mt-1 mb-1">{m.title}</h3>
                <p className="text-[0.875rem] text-[#A0A0A0]">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="container-sword py-16 border-t border-[rgba(255,255,255,0.06)] text-center">
        <span className="text-label text-[#D4AF37] mb-4 block">CERTIFIED & TRUSTED</span>
        <h2 className="text-display-md font-display text-white mb-8">
          Quality You Can Trust
        </h2>
        <img
          src="/certifications.png"
          alt="BIS, ISO, CE, RoHS Certifications"
          className="max-w-[700px] w-full mx-auto"
        />
      </div>
    </div>
  );
}
