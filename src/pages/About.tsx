import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import {
  Droplets,
  TrendingUp,
  GitBranch,
  Brain,
  SlidersHorizontal,
  Wifi,
  Calendar,
  Shield,
  Award,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  ChevronDown,
  Factory,
  Globe,
} from 'lucide-react';
import { stages } from '@/data/stages';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────
   Animated Counter (GSAP)
   ──────────────────────────────── */
interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };
    const tween = gsap.to(obj, {
      value: target,
      duration,
      ease: 'power2.out',
      paused: true,
      onUpdate: () => {
        const val = Math.round(obj.value);
        el.textContent = `${prefix}${val.toLocaleString()}${suffix}`;
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        tween.play();
      },
    });

    return () => {
      trigger.kill();
      tween.kill();
    };
  }, [target, suffix, prefix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ────────────────────────────────
   Section Wrapper with GSAP reveal
   ──────────────────────────────── */
interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ────────────────────────────────
   Stagger Container
   ──────────────────────────────── */
function StaggerContainer({
  children,
  className,
  stagger = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.children;
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger,
          ease: 'power3.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ────────────────────────────────
   Framer Motion hover card (isolated)
   ──────────────────────────────── */
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

const HoverCard = memo(function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  );
});

/* ═════════════════════════════════
   DATA
   ═════════════════════════════════ */

const problemStats = [
  { value: 80, suffix: '%', label: 'Water Wasted', sub: 'Of input water goes down the drain', color: '#E63946' },
  { value: 100, suffix: '%', label: 'Minerals Stripped', sub: 'Ca, Mg removed — essential nutrients lost', color: '#E63946' },
  { value: 0, suffix: '', label: 'Fixed Output', sub: 'No control over TDS levels', color: '#E63946', text: '—' },
  { value: 12, suffix: ' mo', label: 'Short Filter Life', sub: 'Frequent, expensive replacements', color: '#E63946' },
];

const painPoints = [
  { icon: Droplets, title: 'Excessive Water Waste', desc: 'For every 1 liter of purified water, traditional RO wastes 4 liters. In water-scarce India, this is catastrophic.' },
  { icon: Shield, title: 'Zero Mineral Retention', desc: 'RO membranes cannot distinguish between harmful contaminants and essential minerals. Everything gets stripped.' },
  { icon: SlidersHorizontal, title: 'No Personalization', desc: 'One-size-fits-all TDS output regardless of your source water quality or family health needs.' },
  { icon: TrendingUp, title: 'High Maintenance Cost', desc: 'Frequent filter replacements, membrane failures, and service calls add ₹5,000-8,000 annually.' },
  { icon: Brain, title: 'No Smart Features', desc: 'No connectivity, no monitoring, no alerts. You only know something is wrong when water tastes bad.' },
  { icon: Globe, title: 'Environmental Impact', desc: 'Combined water waste and disposable filters create a massive environmental footprint.' },
];

const differentiators = [
  { icon: GitBranch, color: '#7B61FF', title: 'Dual-Membrane Technology', desc: 'Two specialized membranes handle different contaminants. RO removes dissolved solids and heavy metals. NF retains essential minerals. The AI-powered Y Divider intelligently splits the flow.' },
  { icon: Brain, color: '#7B61FF', title: 'Real-Time AI Decisions', desc: 'The Y Divider analyzes incoming TDS every 50 milliseconds and adjusts the NF/RO split ratio dynamically. High TDS triggers more RO. Low TDS favors NF for mineral retention.' },
  { icon: SlidersHorizontal, color: '#00B4D8', title: 'Your Water, Your Way', desc: 'Set output TDS anywhere from 80 to 300 ppm via the touchscreen or mobile app. Different family members, different preferences — one purifier handles it all.' },
  { icon: Droplets, color: '#2EC4B6', title: 'Save Water, Save Money', desc: 'Our dual-membrane design achieves 80% water recovery vs. 20% for traditional RO. That is 60% less water wasted — saving thousands of liters and hundreds of rupees annually.' },
  { icon: Wifi, color: '#00E5FF', title: 'Always Connected', desc: 'Wi-Fi and Bluetooth connectivity enable real-time monitoring via the SWORD mobile app. Track TDS, filter life, consumption patterns, and receive predictive maintenance alerts.' },
  { icon: Calendar, color: '#D4AF37', title: '2× Longer Life', desc: 'Smart load distribution between membranes means less strain on individual filters. Result: 24+ month filter life vs. 6-12 months for traditional RO. Lower total cost of ownership.' },
];

const timelineItems = [
  { date: 'Sept 2025', title: 'Company Incorporated', desc: 'SWORD Home Appliances Pvt. Ltd. was founded in Junagadh, Gujarat with a vision to revolutionize water purification.' },
  { date: 'Oct 2025', title: 'MeitY Grant Secured', desc: 'Secured ₹4 Lakhs in funding from the Ministry of Electronics and IT (MeitY) Startup Hub.' },
  { date: 'Nov 2025', title: 'First Prototype Validated', desc: 'Successfully built and tested the first dual-membrane prototype across 5 Indian cities with varying water conditions.' },
  { date: 'Dec 2025', title: 'Patent Applications Filed', desc: 'Filed patents for the Y Divider AI flow control and dual-membrane smart switching system.' },
  { date: 'Jan 2026', title: 'Pre-Seed Funding Round', desc: 'Raised initial capital from angel investors and the Salford GUIITAR Council to begin production planning.' },
  { date: 'Mar 2026', title: 'Production Begins', desc: 'Started manufacturing at our Gujarat facility with ISO 9001 quality management systems in place.' },
];

const processSteps = [
  { num: '01', title: 'Material Inspection', desc: 'Every component verified against specifications' },
  { num: '02', title: 'Precision Assembly', desc: 'Automated + manual assembly of 14-stage system' },
  { num: '03', title: 'Pressure Testing', desc: '48-hour continuous pressure and leak testing' },
  { num: '04', title: 'Functional QA', desc: 'Full purification cycle test with certified water samples' },
  { num: '05', title: 'Final Inspection', desc: 'Cosmetic, electrical, and packaging verification' },
];

const visionStats = [
  { year: 'Year 1', units: 500 },
  { year: 'Year 2', units: 5000 },
  { year: 'Year 3', units: 20000 },
];

const sustainabilityGoals = [
  { value: '50B', label: 'Liters Water Saved', sub: 'By 2030' },
  { value: '10M', label: 'Plastic Bottles Eliminated', sub: 'Reduced waste' },
  { value: '2028', label: 'Carbon Neutral Target', sub: 'Operations' },
  { value: '1M', label: 'Households Served', sub: 'By 2030' },
];

const awards = [
  { name: 'Gujarat Startup Innovation Award', year: '2026', desc: 'Best Hardware Innovation' },
  { name: 'India Water Purifier Innovation Award', year: '2026', desc: 'Most Innovative Product' },
  { name: 'Salford GUIITAR Council — Best Incubated Startup', year: '2026', desc: 'Outstanding Performance' },
];

/* ────────────────────────────────
   Timeline Item Component
   ──────────────────────────────── */
function TimelineItem({ item, index }: { item: typeof timelineItems[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, x: index % 2 === 0 ? -40 : 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      },
    });

    return () => trigger.kill();
  }, [index]);

  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-start gap-6 md:gap-8',
        'md:flex-row',
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      )}
    >
      {/* Content */}
      <div className={cn('flex-1', isLeft ? 'md:text-right' : 'md:text-left')}>
        <span className="text-data-sm font-mono text-[#D4AF37]">{item.date}</span>
        <h4 className="text-[1.125rem] font-medium text-white mt-1 mb-1">{item.title}</h4>
        <p className="text-[0.875rem] text-[#A0A0A0] leading-relaxed">{item.desc}</p>
      </div>

      {/* Dot */}
      <div className="hidden md:flex flex-col items-center">
        <div className="w-3 h-3 bg-[#D4AF37] border-4 border-[#0A0A0A] z-10" />
        {index < timelineItems.length - 1 && (
          <div className="w-[2px] h-full min-h-[60px] bg-[rgba(212,175,55,0.3)]" />
        )}
      </div>

      {/* Spacer for alternating */}
      <div className="hidden md:block flex-1" />
    </div>
  );
}

/* ═════════════════════════════════
   MAIN PAGE COMPONENT
   ═════════════════════════════════ */

export default function About() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Hero entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 }
      )
        .fromTo(
          heroSubRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          '-=0.3'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ── General section reveals ── */
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    sectionRefs.current.forEach((section) => {
      if (!section) return;
      const items = section.querySelectorAll('.reveal-item');
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 40 });
      const trig = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });
      triggers.push(trig);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const addSectionRef = useCallback((el: HTMLDivElement | null, index: number) => {
    sectionRefs.current[index] = el;
  }, []);

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-[900px] mx-auto">
          <div ref={heroTitleRef}>
            <p className="text-display-lg font-display text-[#A0A0A0] mb-2">
              The Story of
            </p>
            <h1 className="text-display-xl font-display text-[#D4AF37] mb-6">
              SWORD
            </h1>
            <p className="text-body-lg text-white mb-8">
              Reimagining Water Purification for India
            </p>
          </div>

          <p
            ref={heroSubRef}
            className="text-body-lg text-[#A0A0A0] max-w-[600px] mx-auto leading-relaxed"
          >
            Founded in Gujarat, engineered for the world. We are on a mission to make every
            Indian household&apos;s water pure, mineral-rich, and waste-free.
          </p>
        </div>

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[0.75rem] text-[#666666] uppercase tracking-[0.08em]">Scroll</span>
          <ChevronDown size={20} className="text-[#D4AF37] animate-scroll-line" />
        </div>
      </section>

      {/* ═══════ SECTION 2: OUR ORIGIN ═══════ */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="container-sword">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Founding Story */}
            <div ref={(el) => addSectionRef(el, 0)}>
              <SectionReveal>
                <span className="text-label text-[#D4AF37] mb-6 block">OUR ORIGIN</span>
                <div className="space-y-6 text-[1.0625rem] text-[#A0A0A0] leading-[1.7]">
                  <p>
                    SWORD Home Appliances was born from a simple observation: India&apos;s most
                    trusted water purification technology was fundamentally flawed. Reverse Osmosis —
                    the standard in most Indian homes — was stripping water of essential minerals and
                    wasting up to 80% of input water. In a water-scarce country, this was unacceptable.
                  </p>
                  <p>
                    Founded in September 2025 in Junagadh, Gujarat and incubated at the Salford
                    GUIITAR Council, SWORD set out to build the world&apos;s first truly smart water
                    purifier — one that purifies intelligently, retains what your body needs, and
                    respects every drop of water.
                  </p>
                  <p>
                    After 18 months of R&amp;D, engineering iterations, and rigorous testing across
                    diverse Indian water conditions — from the hard water of Rajasthan to the
                    high-TDS supplies of Bangalore — the SWORD Smart RO was born.
                  </p>
                </div>
              </SectionReveal>
            </div>

            {/* Right: Timeline */}
            <div ref={timelineLineRef}>
              <SectionReveal delay={0.2}>
                <span className="text-label text-[#D4AF37] mb-8 block lg:text-center">TIMELINE</span>
                <div className="space-y-8">
                  {timelineItems.map((item, i) => (
                    <TimelineItem key={item.date} item={item} index={i} />
                  ))}
                </div>
              </SectionReveal>
            </div>
          </div>

          {/* CEO Quote */}
          <SectionReveal className="mt-20">
            <div className="relative glass-panel border-l-[3px] border-l-[#D4AF37] p-8 md:p-12">
              <span
                className="absolute top-4 left-6 text-display-xl font-display text-[rgba(212,175,55,0.2)] select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="text-display-md font-display text-white italic relative z-10 max-w-[800px]">
                We didn&apos;t set out to build another RO. We set out to solve India&apos;s water
                purification problem at its root — with intelligence, not brute force.
              </blockquote>
              <p className="text-body-sm text-[#D4AF37] mt-6 font-medium">
                — Priyank Joshi, Founder &amp; CEO
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 3: THE PROBLEM ═══════ */}
      <section className="py-24 md:py-32 bg-[#111111]">
        <div className="container-sword">
          <SectionReveal>
            <span className="text-label text-[#E63946] mb-4 block">THE PROBLEM</span>
            <h2 className="text-display-lg font-display text-white mb-16">
              Traditional RO is Broken
            </h2>
          </SectionReveal>

          {/* Stats Row */}
          <StaggerContainer
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            stagger={0.15}
          >
            {problemStats.map((stat) => (
              <div key={stat.label} className="glass-panel p-6 text-center">
                <p className="text-data-lg font-mono mb-2" style={{ color: stat.color }}>
                  {stat.text || <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="text-[0.875rem] text-white font-medium mb-1">{stat.label}</p>
                <p className="text-[0.75rem] text-[#A0A0A0]">{stat.sub}</p>
              </div>
            ))}
          </StaggerContainer>

          {/* Pain Points Grid */}
          <div ref={(el) => addSectionRef(el, 1)}>
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              stagger={0.1}
            >
              {painPoints.map((pp) => (
                <div key={pp.title} className="reveal-item glass-card p-6 group">
                  <pp.icon
                    size={28}
                    className="text-[#E63946] mb-4 transition-transform duration-300 group-hover:scale-110"
                  />
                  <h4 className="text-[1rem] font-medium text-white mb-2">{pp.title}</h4>
                  <p className="text-[0.875rem] text-[#A0A0A0] leading-relaxed">{pp.desc}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 4: OUR SOLUTION ═══════ */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="container-sword">
          <SectionReveal className="text-center mb-16">
            <span className="text-label text-[#2EC4B6] mb-4 block">OUR SOLUTION</span>
            <h2 className="text-display-lg font-display text-white mb-4">
              Intelligence Meets Purity
            </h2>
            <p className="text-body-lg text-[#A0A0A0] max-w-[700px] mx-auto">
              The SWORD Smart RO is the result of rethinking water purification from first principles.
            </p>
          </SectionReveal>

          {/* Differentiators Grid */}
          <div ref={(el) => addSectionRef(el, 2)}>
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              stagger={0.12}
            >
              {differentiators.map((diff) => (
                <HoverCard key={diff.title}>
                  <div className="glass-card p-6 h-full group cursor-default">
                    <div
                      className="w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${diff.color}15` }}
                    >
                      <diff.icon size={24} style={{ color: diff.color }} />
                    </div>
                    <h4 className="text-display-md font-display text-white mb-3" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
                      {diff.title}
                    </h4>
                    <p className="text-[0.875rem] text-[#A0A0A0] leading-relaxed">
                      {diff.desc}
                    </p>
                  </div>
                </HoverCard>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 5: 14-STAGE DEEP DIVE ═══════ */}
      <section className="py-16 md:py-24 bg-[#111111]">
        <div className="container-sword">
          <SectionReveal className="text-center mb-12">
            <h2 className="text-display-lg font-display text-white mb-4">
              14 Stages. Zero Compromise.
            </h2>
            <p className="text-body-lg text-[#A0A0A0] max-w-[700px] mx-auto">
              Every drop undergoes 14 meticulously engineered purification stages before reaching your glass.
            </p>
          </SectionReveal>

          {/* Stage Cards - Horizontal scroll on mobile, grid on desktop */}
          <div ref={(el) => addSectionRef(el, 3)}>
            <StaggerContainer
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12"
              stagger={0.06}
            >
              {stages.map((stage) => (
                <div key={stage.id} className="reveal-item">
                  <StageCard stage={stage} />
                </div>
              ))}
            </StaggerContainer>
          </div>

          {/* Technical Credibility Bar */}
          <SectionReveal className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[rgba(255,255,255,0.06)] pt-12">
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#7B61FF] mb-1">50ms</p>
                <p className="text-[0.875rem] text-[#A0A0A0]">AI response time</p>
              </div>
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#00E5FF] mb-1">0.0001μm</p>
                <p className="text-[0.875rem] text-[#A0A0A0]">RO membrane pore size</p>
              </div>
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#2EC4B6] mb-1">99.9%</p>
                <p className="text-[0.875rem] text-[#A0A0A0]">Bacteria removal rate</p>
              </div>
            </div>
          </SectionReveal>

          {/* Flowchart Image */}
          <SectionReveal className="mt-16">
            <div className="relative overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <img
                src="/nf-ro-diagram.png"
                alt="SWORD 14-Stage Purification Flowchart"
                className="w-full h-auto object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-30 pointer-events-none" />
            </div>
            <p className="text-[0.75rem] text-[#666666] text-center mt-4 uppercase tracking-[0.05em]">
              SWORD Smart RO — 14 Stage Purification Flow
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 6: MANUFACTURING ═══════ */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="container-sword">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Content */}
            <div ref={(el) => addSectionRef(el, 4)}>
              <SectionReveal>
                <span className="text-label text-[#D4AF37] mb-4 block">MANUFACTURING</span>
                <h2 className="text-display-lg font-display text-white mb-6">
                  Made in India. Built to Last.
                </h2>
                <p className="text-[1.0625rem] text-[#A0A0A0] leading-[1.7] mb-10">
                  Every SWORD Smart RO is manufactured in our Gujarat facility under strict ISO 9001
                  quality management systems. From raw material inspection to final functional testing,
                  each unit undergoes 47 quality checkpoints before leaving the factory.
                </p>

                <div className="space-y-6">
                  {processSteps.map((step) => (
                    <div key={step.num} className="reveal-item flex gap-4 items-start">
                      <span className="w-10 h-10 flex items-center justify-center bg-[rgba(212,175,55,0.1)] text-[#D4AF37] text-data-sm font-mono flex-shrink-0">
                        {step.num}
                      </span>
                      <div>
                        <h4 className="text-[1rem] font-medium text-white mb-1">{step.title}</h4>
                        <p className="text-[0.875rem] text-[#A0A0A0]">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionReveal>
            </div>

            {/* Right: Placeholder visual */}
            <SectionReveal delay={0.2}>
              <div className="relative h-full min-h-[400px] bg-[#111111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 70% 60%, #00B4D8 0%, transparent 50%)' }} />
                <div className="text-center relative z-10">
                  <Factory size={48} className="text-[#D4AF37] mx-auto mb-4 opacity-60" />
                  <p className="text-[0.875rem] text-[#666666] uppercase tracking-[0.05em]">
                    Gujarat Manufacturing Facility
                  </p>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Quality Stats */}
          <SectionReveal className="mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[rgba(255,255,255,0.06)] pt-12">
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#D4AF37] mb-1">
                  <AnimatedCounter target={47} />
                </p>
                <p className="text-[0.875rem] text-[#A0A0A0]">Quality Checkpoints</p>
              </div>
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#2EC4B6] mb-1">
                  <AnimatedCounter target={100} suffix="%" />
                </p>
                <p className="text-[0.875rem] text-[#A0A0A0]">Tested Before Dispatch</p>
              </div>
              <div className="text-center">
                <p className="text-data-lg font-mono text-[#00E5FF] mb-1">&lt; 0.5%</p>
                <p className="text-[0.875rem] text-[#A0A0A0]">Defect Rate</p>
              </div>
            </div>
          </SectionReveal>

          {/* Made in India Badge */}
          <SectionReveal className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 border border-[#D4AF37] px-8 py-4">
              <span className="text-2xl">🇮🇳</span>
              <span className="text-label text-[#D4AF37] tracking-[0.12em]">MADE IN INDIA</span>
            </div>
            <p className="text-[0.875rem] text-[#A0A0A0] mt-4">
              Proudly designed, engineered, and manufactured in Gujarat, India
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 7: LEADERSHIP ═══════ */}
      <section className="py-24 md:py-32 bg-[#111111]">
        <div className="container-sword">
          <SectionReveal className="text-center mb-16">
            <h2 className="text-display-lg font-display text-white">
              The Team Behind SWORD
            </h2>
          </SectionReveal>

          {/* CEO Profile */}
          <div ref={(el) => addSectionRef(el, 5)}>
            <SectionReveal>
              <div className="glass-panel p-8 md:p-12 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-[200px] h-[250px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                      <span className="text-display-lg font-display text-[#D4AF37]">PJ</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-display-md font-display text-white mb-1">Priyank Joshi</h3>
                    <p className="text-body-base text-[#D4AF37] mb-6">Co-Founder &amp; CEO</p>
                    <p className="text-body-sm text-[#A0A0A0] leading-relaxed mb-6">
                      With 8+ years in purifier sales and a computer engineering background, Priyank
                      blends technical expertise with market insight to drive smart, sustainable water
                      solutions. He led the 18-month R&amp;D effort that produced the world&apos;s first
                      dual-membrane smart purifier and holds a patent pending for the Y Divider smart
                      switching technology.
                    </p>
                    <div className="flex flex-wrap gap-4 text-data-sm font-mono text-[#A0A0A0]">
                      <a
                        href="mailto:priyank.joshi@swordhome.com"
                        className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                      >
                        <Mail size={14} />
                        priyank.joshi@swordhome.com
                      </a>
                      <a
                        href="tel:+919537797597"
                        className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                      >
                        <Phone size={14} />
                        +91 95377 97597
                      </a>
                      <span className="flex items-center gap-2">
                        <Linkedin size={14} />
                        LinkedIn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* COO Profile */}
          <div ref={(el) => addSectionRef(el, 6)}>
            <SectionReveal>
              <div className="glass-panel p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-[200px] h-[250px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                      <span className="text-display-lg font-display text-[#2EC4B6]">JJ</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-display-md font-display text-white mb-1">Jitendra Joshi</h3>
                    <p className="text-body-base text-[#2EC4B6] mb-6">Co-Founder &amp; COO</p>
                    <p className="text-body-sm text-[#A0A0A0] leading-relaxed mb-6">
                      An ITI-trained electrician with 28 years at GETCO (Gujarat Energy Transmission
                      Corporation), Jitendra brings deep technical expertise, operational discipline,
                      and infrastructure knowledge to SWORD&apos;s foundation. His experience in
                      managing large-scale electrical systems ensures every SWORD unit meets the
                      highest standards of safety and reliability.
                    </p>
                    <div className="flex flex-wrap gap-4 text-data-sm font-mono text-[#A0A0A0]">
                      <span className="flex items-center gap-2">
                        <Mail size={14} />
                        jitendra.joshi@swordhome.com
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone size={14} />
                        +91 95377 97597
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 8: CERTIFICATIONS & AWARDS ═══════ */}
      <section className="py-16 md:py-24 bg-[#0A0A0A]">
        <div className="container-sword">
          <SectionReveal className="text-center mb-12">
            <h2 className="text-display-lg font-display text-white mb-4">
              Certified &amp; Trusted
            </h2>
            <p className="text-body-lg text-[#A0A0A0] max-w-[600px] mx-auto">
              Every SWORD unit meets the highest international standards.
            </p>
          </SectionReveal>

          {/* Certifications Image */}
          <SectionReveal className="mb-16">
            <div className="relative max-w-[700px] mx-auto">
              <img
                src="/certifications.png"
                alt="BIS, ISO, CE, RoHS Certifications"
                className="w-full h-auto"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-[700px] mx-auto">
              {[
                { name: 'BIS', desc: 'IS 16240 Compliant' },
                { name: 'ISO 9001', desc: 'Quality Management' },
                { name: 'CE', desc: 'European Conformity' },
                { name: 'RoHS', desc: 'Hazardous Substances' },
              ].map((cert) => (
                <div key={cert.name} className="text-center">
                  <p className="text-[0.875rem] font-medium text-white mb-1">{cert.name}</p>
                  <p className="text-[0.75rem] text-[#A0A0A0]">{cert.desc}</p>
                </div>
              ))}
            </div>
          </SectionReveal>

          {/* Patents */}
          <SectionReveal className="mb-16">
            <div className="glass-panel p-8 max-w-[700px] mx-auto">
              <span className="text-label text-[#D4AF37] mb-4 block">INTELLECTUAL PROPERTY</span>
              <div className="space-y-3">
                <p className="text-data-sm font-mono text-[#A0A0A0]">
                  <span className="text-[#2EC4B6] mr-2">●</span>
                  Dual-Membrane Smart Switching System (NF + RO) — Patent Pending
                </p>
                <p className="text-data-sm font-mono text-[#A0A0A0]">
                  <span className="text-[#2EC4B6] mr-2">●</span>
                  Y Divider AI Flow Control Mechanism — Patent Pending
                </p>
              </div>
            </div>
          </SectionReveal>

          {/* Awards */}
          <div ref={(el) => addSectionRef(el, 7)}>
            <SectionReveal>
              <h3 className="text-display-md font-display text-white text-center mb-8">
                Awards &amp; Recognition
              </h3>
            </SectionReveal>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6" stagger={0.1}>
              {awards.map((award) => (
                <div key={award.name} className="glass-card p-6 text-center">
                  <Award size={28} className="text-[#D4AF37] mx-auto mb-4" />
                  <p className="text-[1rem] font-medium text-white mb-1">{award.name}</p>
                  <p className="text-data-sm font-mono text-[#D4AF37] mb-1">{award.year}</p>
                  <p className="text-[0.75rem] text-[#A0A0A0]">{award.desc}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 9: MISSION & VISION ═══════ */}
      <section className="py-24 md:py-32 bg-[#111111]">
        <div className="container-sword max-w-[800px] mx-auto text-center">
          <SectionReveal>
            <span className="text-label text-[#D4AF37] mb-6 block">OUR MISSION</span>
            <p className="text-display-md font-display text-white italic leading-[1.4] mb-16">
              To provide every Indian household with intelligent water purification that preserves
              essential minerals, eliminates waste, and adapts to individual needs — using cutting-edge
              AI and IoT technology.
            </p>
          </SectionReveal>

          <SectionReveal>
            <span className="text-label text-[#2EC4B6] mb-6 block">OUR VISION</span>
            <p className="text-body-lg text-[#A0A0A0] leading-relaxed mb-16">
              By 2030, SWORD aims to be India&apos;s leading smart water technology company, serving
              1 million households, saving 50 billion liters of water annually, and setting the global
              standard for intelligent water purification.
            </p>
          </SectionReveal>

          {/* Vision Stats */}
          <div ref={(el) => addSectionRef(el, 8)}>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16" stagger={0.1}>
              {visionStats.map((vs) => (
                <div key={vs.year} className="glass-panel p-6">
                  <p className="text-label text-[#A0A0A0] mb-2">{vs.year}</p>
                  <p className="text-data-lg font-mono text-[#D4AF37] mb-1">
                    <AnimatedCounter target={vs.units} />
                  </p>
                  <p className="text-[0.875rem] text-[#A0A0A0]">Units Target</p>
                </div>
              ))}
            </StaggerContainer>
          </div>

          {/* Sustainability Goals */}
          <SectionReveal>
            <span className="text-label text-[#2EC4B6] mb-8 block">SUSTAINABILITY GOALS</span>
          </SectionReveal>
          <div ref={(el) => addSectionRef(el, 9)}>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-6" stagger={0.08}>
              {sustainabilityGoals.map((goal) => (
                <div key={goal.label} className="text-center">
                  <p className="text-data-lg font-mono text-[#2EC4B6] mb-1">{goal.value}</p>
                  <p className="text-[0.875rem] text-white mb-1">{goal.label}</p>
                  <p className="text-[0.75rem] text-[#A0A0A0]">{goal.sub}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>

          {/* SDG Alignment */}
          <SectionReveal className="mt-16">
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-10">
              <p className="text-[0.75rem] text-[#666666] uppercase tracking-[0.08em] mb-4">
                Aligned with UN Sustainable Development Goals
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { num: '6', name: 'Clean Water & Sanitation' },
                  { num: '12', name: 'Responsible Consumption' },
                  { num: '13', name: 'Climate Action' },
                ].map((sdg) => (
                  <div
                    key={sdg.num}
                    className="flex items-center gap-2 bg-[rgba(46,196,182,0.1)] px-4 py-2"
                  >
                    <span className="text-[#2EC4B6] font-mono font-bold">{sdg.num}</span>
                    <span className="text-[0.75rem] text-[#A0A0A0]">{sdg.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 10: PARTNERS/BACKERS ═══════ */}
      <section className="py-16 md:py-20 bg-[#0A0A0A]">
        <div className="container-sword">
          <SectionReveal className="text-center">
            <span className="text-label text-[#D4AF37] mb-6 block">SUPPORTED BY</span>
            <div className="flex flex-wrap justify-center items-center gap-12">
              <div className="glass-card px-8 py-6">
                <p className="text-[1.125rem] font-medium text-white mb-1">Salford GUIITAR Council</p>
                <p className="text-[0.75rem] text-[#A0A0A0]">Incubation Partner</p>
              </div>
              <div className="glass-card px-8 py-6">
                <p className="text-[1.125rem] font-medium text-white mb-1">MeitY Startup Hub</p>
                <p className="text-[0.75rem] text-[#A0A0A0]">Government of India</p>
              </div>
              <div className="glass-card px-8 py-6">
                <p className="text-[1.125rem] font-medium text-white mb-1">Ministry of Electronics &amp; IT</p>
                <p className="text-[0.75rem] text-[#A0A0A0]">₹4 Lakhs Grant</p>
              </div>
            </div>
            <p className="text-[0.875rem] text-[#A0A0A0] mt-8">
              Incubated at Salford GUIITAR Council — University of Salford, UK partnership
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 11: CTA ═══════ */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, rgba(212,175,55,0.1) 100%)' }}
      >
        <div
          className="absolute inset-0 border-t border-[rgba(212,175,55,0.2)]"
        />
        <div className="container-sword relative z-10 text-center">
          <SectionReveal>
            <h2 className="text-display-lg font-display text-white mb-4">
              Be Part of the Water Revolution
            </h2>
            <p className="text-body-lg text-[#A0A0A0] max-w-[600px] mx-auto mb-10">
              Experience the future of water purification. Smart, sustainable, and made for India.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.button
                onClick={() => navigate('/shop')}
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              >
                Buy SWORD Smart RO
              </motion.button>
              <motion.button
                onClick={() => navigate('/about')}
                className="btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              >
                Contact Us
              </motion.button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-data-sm font-mono text-[#666666]">
              <span className="flex items-center gap-2">
                <Mail size={14} />
                support@swordhome.com
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} />
                +91 95377 97597
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} />
                Junagadh, Gujarat
              </span>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

/* ═════════════════════════════════
   Stage Card Sub-Component
   ═════════════════════════════════ */
function StageCard({ stage }: { stage: (typeof stages)[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="glass-card p-4 cursor-pointer h-full"
      onClick={() => setExpanded(!expanded)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      layout
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="w-10 h-10 flex items-center justify-center mb-3 text-[#0A0A0A] font-mono font-bold text-[0.875rem]"
          style={{ backgroundColor: stage.color }}
        >
          {stage.number}
        </div>
        <p className="text-[0.75rem] font-medium text-white mb-1 leading-tight">{stage.name}</p>
        <p className="text-[0.625rem] text-[#666666] uppercase tracking-[0.05em]">
          {stage.contaminantRemoved !== 'None — flow control' && stage.contaminantRemoved !== 'None — TDS monitoring' && stage.contaminantRemoved !== 'None — pressure safety' && stage.contaminantRemoved !== 'None — pressure boost' && stage.contaminantRemoved !== 'None — AI routing decision' && stage.contaminantRemoved !== 'None — flow control' && stage.contaminantRemoved !== 'None — blending stage' && stage.contaminantRemoved !== 'None — mineral addition' && stage.contaminantRemoved !== 'None — output verification'
            ? 'Removes: ' + stage.contaminantRemoved
            : stage.contaminantRemoved}
        </p>
      </div>

      {/* Expanded detail */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 mt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[0.75rem] text-[#A0A0A0] mb-2">{stage.description}</p>
          <p className="text-[0.625rem] text-[#666666] font-mono leading-relaxed">
            {stage.technicalDetail}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
