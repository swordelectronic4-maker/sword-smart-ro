import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { stages } from '@/data/stages';
import { reviews } from '@/data/reviews';
import { products } from '@/data/products';
import LoadingScreen from '@/components/LoadingScreen';
import {
  ChevronDown, Brain, Droplets, Gem, Sliders, Wifi, Calendar,
  Shield, Truck, Award, Star, ArrowRight, Minus, Plus, ChevronUp,
  RotateCw, ZoomIn, Layers, Eye, Play, Pause, MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ───────────────────── Scene 1: Hero ───────────────────── */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w: number, h: number;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = [];
    const COUNT = 80;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />;
}

function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [tdsValue, setTdsValue] = useState(850);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setTdsValue((prev) => {
        if (prev <= 150) return 850;
        return prev - 5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[rgba(10,10,10,0.7)]" />
      </div>

      <ParticleBackground />

      {/* Product Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] z-[1] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-[900px]">
        {/* Logo Reveal */}
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
          animate={isInView ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 2.5 }}
          className="mb-6"
        >
          <img
            src="/logo-gold.png"
            alt="SWORD Smart Water"
            className="h-[60px] md:h-[80px] w-auto mx-auto"
            style={{ filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))' }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 2.8 }}
          className="text-display-xl font-display text-white mb-4"
        >
          The Future of Pure Water
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 3.1 }}
          className="text-body-lg text-[#A0A0A0] max-w-[600px] mx-auto mb-8"
        >
          India&apos;s first AI-powered dual-membrane smart purifier. Save 60% water. Retain essential minerals.
        </motion.p>

        {/* TDS Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 3.4 }}
          className="flex items-center justify-center gap-8 mb-10"
        >
          <div className="text-center">
            <p className="text-label text-[#666666] mb-1">TDS INPUT</p>
            <p className="text-data-lg font-mono text-[#E63946]">{tdsValue} <span className="text-data-sm">ppm</span></p>
          </div>
          <div className="w-[1px] h-12 bg-[rgba(255,255,255,0.1)]" />
          <div className="text-center">
            <p className="text-label text-[#666666] mb-1">TDS OUTPUT</p>
            <p className="text-data-lg font-mono text-[#2EC4B6]">150 <span className="text-data-sm">ppm</span></p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 3.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/product/sword-smart-ro" className="btn-primary">
            Explore Technology
          </Link>
          <Link to="/shop" className="btn-secondary">
            Buy Now
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-label text-[#666666]">SCROLL</span>
        <div className="w-[1px] h-10 bg-[rgba(255,255,255,0.3)] animate-scroll-line" />
      </motion.div>
    </section>
  );
}

/* ───────────────────── Scene 2: Exploded Engineering ───────────────────── */

function ExplodedViewScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section ref={ref} className="relative py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">14-STAGE PURIFICATION</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Engineering Excellence, Inside Out
          </h2>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            Every drop passes through 14 meticulously engineered stages — from sediment filtration to mineral enrichment.
          </p>
        </motion.div>

        {/* Flowchart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-16"
        >
          <img
            src="/assets/product-flowchart.png"
            alt="14-stage purification flowchart"
            className="w-full max-w-[900px] mx-auto"
          />
        </motion.div>

        {/* Stage Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {stages.map((stage, index) => (
            <motion.button
              key={stage.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              onClick={() => setActiveStage(index)}
              className={cn(
                'p-4 border transition-all duration-300 text-left group',
                activeStage === index
                  ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.08)]'
                  : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] bg-[#111111]'
              )}
            >
              <div
                className="w-8 h-8 flex items-center justify-center text-[0.75rem] font-mono font-bold mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: stage.color + '20', color: stage.color }}
              >
                {stage.number}
              </div>
              <h3 className="text-[0.75rem] font-medium text-white mb-1 leading-tight">{stage.name}</h3>
              <p className="text-[0.65rem] text-[#666666] leading-tight">{stage.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Active Stage Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-6 mt-8 max-w-[700px] mx-auto"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stages[activeStage].color + '20' }}
              >
                <span className="text-data-md font-mono" style={{ color: stages[activeStage].color }}>
                  {stages[activeStage].number}
                </span>
              </div>
              <div>
                <h3 className="text-[1.125rem] font-medium text-white mb-1">{stages[activeStage].name}</h3>
                <p className="text-[0.875rem] text-[#A0A0A0] mb-2">{stages[activeStage].description}</p>
                <p className="text-[0.75rem] text-[#666666]">{stages[activeStage].technicalDetail}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]">
                  <span className="text-[0.65rem] text-[#D4AF37] uppercase tracking-[0.05em]">
                    Removes: {stages[activeStage].contaminantRemoved}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────────────────── Scene 3: 3D Purification Journey ───────────────────── */

function PurificationJourneyScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 0.5;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [isInView]);

  const currentStage = Math.min(Math.floor((progress / 100) * 14), 13);
  const tdsIn = Math.max(850 - (progress / 100) * 700, 150);
  const tdsOut = progress > 50 ? 150 : 0;

  return (
    <section ref={ref} className="relative py-24 bg-gradient-to-b from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A] overflow-hidden">
      {/* Animated water flow lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100 T1500,100"
            fill="none"
            stroke="#00B4D8"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
          <motion.path
            d="M0,200 Q250,150 500,200 T1000,200 T1500,200"
            fill="none"
            stroke="#2EC4B6"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 3, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.path
            d="M0,300 Q250,250 500,300 T1000,300 T1500,300"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 3, ease: 'easeInOut', delay: 1 }}
          />
        </svg>
      </div>

      <div className="container-sword relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">PURIFICATION JOURNEY</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Watch Water Transform
          </h2>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            From raw, contaminated water to crystal-clear, mineral-rich purity. Follow every step of the journey.
          </p>
        </motion.div>

        {/* HUD Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* TDS Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-panel p-6 text-center"
          >
            <p className="text-label text-[#666666] mb-2">TDS INPUT</p>
            <p className="text-data-lg font-mono text-[#E63946]">
              {Math.round(tdsIn)} <span className="text-data-sm">ppm</span>
            </p>
            <div className="w-full h-1 bg-[#1A1A1A] mt-3">
              <div className="h-full bg-[#E63946] transition-all duration-300" style={{ width: `${(tdsIn / 1000) * 100}%` }} />
            </div>
          </motion.div>

          {/* Active Stage */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="glass-panel p-6 text-center border-[#D4AF37]"
          >
            <p className="text-label text-[#D4AF37] mb-2">ACTIVE STAGE</p>
            <div
              className="w-10 h-10 mx-auto flex items-center justify-center mb-2"
              style={{ backgroundColor: stages[currentStage].color + '20' }}
            >
              <span className="text-data-md font-mono" style={{ color: stages[currentStage].color }}>
                {stages[currentStage].number}
              </span>
            </div>
            <p className="text-[1rem] text-white font-medium">{stages[currentStage].name}</p>
            <p className="text-[0.75rem] text-[#A0A0A0] mt-1">{stages[currentStage].description}</p>
          </motion.div>

          {/* TDS Output */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="glass-panel p-6 text-center"
          >
            <p className="text-label text-[#666666] mb-2">TDS OUTPUT</p>
            <p className="text-data-lg font-mono text-[#2EC4B6]">
              {tdsOut} <span className="text-data-sm">ppm</span>
            </p>
            <div className="w-full h-1 bg-[#1A1A1A] mt-3">
              <div
                className="h-full bg-[#2EC4B6] transition-all duration-500"
                style={{ width: `${(tdsOut / 300) * 100}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full h-1 bg-[rgba(255,255,255,0.05)]">
            <motion.div
              className="h-full relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0066CC, #4A90D9, #5C6B73, #00B4D8, #7B61FF, #00E5FF, #2EC4B6, #9B5DE5, #FFD700, #90E0EF)',
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[0.65rem] text-[#666666]">RAW WATER</span>
            <span className="text-[0.65rem] text-[#666666]">PURIFIED</span>
          </div>
        </div>

        {/* Why SWORD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="glass-panel p-8 max-w-[800px] mx-auto text-center"
        >
          <h3 className="text-display-md font-display text-white mb-4">Why SWORD is Different</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: '14', label: 'Purification Stages', color: '#00B4D8' },
              { value: '60%', label: 'Water Saved', color: '#2EC4B6' },
              { value: '40%', label: 'Minerals Retained', color: '#FFD700' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-data-lg font-mono mb-1" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[0.75rem] text-[#A0A0A0] uppercase tracking-[0.05em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Scene 4: NF/RO Smart Switching ───────────────────── */

function NfRoSwitchingScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [simulatedTds, setSimulatedTds] = useState(400);
  const [roPercent, setRoPercent] = useState(50);
  const [nfPercent, setNfPercent] = useState(50);

  useEffect(() => {
    if (simulatedTds > 500) { setRoPercent(70); setNfPercent(30); }
    else if (simulatedTds > 200) { setRoPercent(50); setNfPercent(50); }
    else { setRoPercent(30); setNfPercent(70); }
  }, [simulatedTds]);

  const tdsZone = simulatedTds > 500 ? 'High' : simulatedTds > 200 ? 'Medium' : 'Low';
  const tdsColor = simulatedTds > 500 ? '#E63946' : simulatedTds > 200 ? '#E8A838' : '#2EC4B6';

  return (
    <section ref={ref} className="relative py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">AI-POWERED TECHNOLOGY</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Smart NF/RO Switching
          </h2>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            The Y Divider intelligently routes water between NF and RO membranes based on real-time TDS readings. No manual intervention needed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <img
              src="/nf-ro-diagram.png"
              alt="NF/RO flow diagram showing Y Divider splitting water into two paths"
              className="w-full rounded-lg"
            />
          </motion.div>

          {/* Interactive Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6">
              <h3 className="text-label text-white mb-4">TDS SIMULATOR</h3>
              <p className="text-[0.875rem] text-[#A0A0A0] mb-4">
                Adjust the input TDS to see how the AI adjusts the NF/RO split ratio in real-time.
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label text-[#666666]">INPUT TDS</span>
                  <span className="text-data-md font-mono" style={{ color: tdsColor }}>
                    {simulatedTds} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  value={simulatedTds}
                  onChange={(e) => setSimulatedTds(Number(e.target.value))}
                  className="w-full h-2 appearance-none bg-[#1A1A1A] accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[0.65rem] text-[#666666]">50 ppm</span>
                  <span className="text-[0.65rem] text-[#666666]">800 ppm</span>
                </div>
              </div>

              {/* TDS Zone indicator */}
              <div className="flex items-center gap-3 mb-6 p-3 border border-[rgba(255,255,255,0.06)] bg-[#111111]">
                <div className="w-3 h-3" style={{ backgroundColor: tdsColor }} />
                <div>
                  <p className="text-[0.75rem] text-white font-medium">{tdsZone} TDS Zone</p>
                  <p className="text-[0.65rem] text-[#666666]">
                    {simulatedTds > 500
                      ? 'High contamination — more RO needed'
                      : simulatedTds > 200
                        ? 'Balanced — equal NF/RO split'
                        : 'Low contamination — more NF for mineral retention'}
                  </p>
                </div>
              </div>

              {/* Flow Split Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[0.75rem] mb-1">
                    <span className="text-[#00E5FF] font-medium">RO PATH</span>
                    <span className="text-[#00E5FF] font-mono">{roPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#1A1A1A]">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: '#00E5FF' }}
                      animate={{ width: `${roPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[0.75rem] mb-1">
                    <span className="text-[#2EC4B6] font-medium">NF PATH</span>
                    <span className="text-[#2EC4B6] font-mono">{nfPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#1A1A1A]">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: '#2EC4B6' }}
                      animate={{ width: `${nfPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Decision Log */}
            <div className="glass-panel p-6">
              <h3 className="text-label text-[#666666] mb-3">AI DECISION LOG</h3>
              <div className="space-y-2 font-mono text-[0.75rem]">
                <p className="text-[#A0A0A0]">
                  <span className="text-[#00B4D8]">&gt;</span> TDS sensor reading: {simulatedTds} ppm
                </p>
                <p className="text-[#A0A0A0]">
                  <span className="text-[#00B4D8]">&gt;</span> Mode:{' '}
                  <span className="text-[#D4AF37]">
                    {simulatedTds > 500 ? 'HIGH TDS — RO HEAVY' : simulatedTds > 200 ? 'BALANCED' : 'LOW TDS — NF HEAVY'}
                  </span>
                </p>
                <p className="text-[#A0A0A0]">
                  <span className="text-[#00B4D8]">&gt;</span> RO split: {roPercent}% | NF split: {nfPercent}%
                </p>
                <p className="text-[#A0A0A0]">
                  <span className="text-[#00B4D8]">&gt;</span> Mineral retention:{' '}
                  <span className="text-[#2EC4B6]">OPTIMAL</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Scene 5: Interactive Exploration ───────────────────── */

function InteractiveExplorationScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = [
    { id: 1, x: 25, y: 20, label: 'Water Inlet', desc: 'Controls raw water entry with 3-ball valve design' },
    { id: 2, x: 75, y: 25, label: 'Sediment Filter', desc: '5-micron PP cotton filtration, 6-month life' },
    { id: 3, x: 50, y: 15, label: 'TDS Sensor', desc: 'Real-time influent water quality monitoring' },
    { id: 4, x: 35, y: 50, label: 'Y Divider', desc: 'AI Smart Valve: Auto NF/RO switching' },
    { id: 5, x: 65, y: 55, label: 'RO Membrane', desc: '0.0001 micron, removes heavy metals' },
    { id: 6, x: 80, y: 70, label: 'NF Membrane', desc: 'Retains Ca, Mg essential minerals' },
    { id: 7, x: 20, y: 75, label: 'Mineral Cartridge', desc: 'Adds Ca²⁺ and Mg²⁺ for health benefits' },
    { id: 8, x: 50, y: 85, label: 'UF Membrane', desc: '0.01 micron, bacteria/virus barrier' },
  ];

  const features = [
    { icon: RotateCw, label: '360° Rotation', desc: 'Full product view from every angle' },
    { icon: ZoomIn, label: 'Zoom Controls', desc: 'Examine details up close' },
    { icon: Layers, label: 'Exploded View', desc: 'See all internal components' },
    { icon: Eye, label: 'Cutaway View', desc: 'Transparent body reveals internals' },
    { icon: Play, label: 'Replay Animation', desc: 'Watch purification in action' },
    { icon: MousePointer, label: 'Touch Rotation', desc: 'Drag to rotate on touch devices' },
  ];

  return (
    <section ref={ref} className="relative py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">EXPLORE</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Interactive 3D Exploration
          </h2>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            Discover every detail of the SWORD Smart RO. Click on hotspots to learn about each component.
          </p>
        </motion.div>

        {/* Product with Hotspots */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-[600px] mx-auto mb-16"
        >
          <div className="relative bg-gradient-to-b from-[#111111] to-[#0A0A0A] p-8 md:p-12">
            <img
              src="/assets/product-front.png"
              alt="SWORD Smart RO Purifier with interactive hotspots"
              className="w-full max-w-[350px] mx-auto object-contain"
            />

            {/* Hotspots */}
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                className="absolute z-10 group"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                <div className="relative">
                  <div className="w-4 h-4 bg-[#D4AF37] border-2 border-white shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-pulse-gold" />
                  <div className="absolute inset-0 w-4 h-4 border border-[#D4AF37] animate-ping opacity-30" />
                </div>
                {/* Tooltip */}
                <AnimatePresence>
                  {activeHotspot === hotspot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[200px] glass-panel p-3 text-left z-20"
                    >
                      <p className="text-[0.75rem] font-medium text-[#D4AF37] mb-1">{hotspot.label}</p>
                      <p className="text-[0.65rem] text-[#A0A0A0]">{hotspot.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index + 0.5 }}
              className="glass-card p-5 text-center hover:border-[rgba(212,175,55,0.3)] transition-all duration-300 group"
            >
              <feature.icon size={24} className="text-[#D4AF37] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-[0.875rem] font-medium text-white mb-1">{feature.label}</h3>
              <p className="text-[0.75rem] text-[#666666]">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Scene 6: Comparison Mode ───────────────────── */

function ComparisonScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, x)));
  };

  const traditionalStats = [
    { label: 'Water Wasted', value: '80%', color: '#E63946' },
    { label: 'Mineral Retention', value: '0%', color: '#E63946' },
    { label: 'Fixed TDS Output', value: '10-20 ppm', color: '#E63946' },
  ];

  const swordStats = [
    { label: 'Water Saved', value: '60%', color: '#2EC4B6' },
    { label: 'Mineral Retained', value: '40%', color: '#2EC4B6' },
    { label: 'Custom TDS', value: '80-300 ppm', color: '#2EC4B6' },
  ];

  return (
    <section ref={ref} className="relative py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">COMPARISON</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            SWORD vs Traditional RO
          </h2>
          <p className="text-[#A0A0A0] max-w-[600px] mx-auto">
            See why India&apos;s smartest households are making the switch.
          </p>
        </motion.div>

        {/* Split Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-0 mb-12 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Traditional RO */}
          <div
            className="relative p-8 md:p-12 min-h-[400px] flex flex-col justify-center"
            style={{
              background: 'linear-gradient(135deg, #1A0A0A 0%, rgba(230, 57, 70, 0.05) 100%)',
            }}
          >
            <span className="text-label text-[#E63946] mb-3">TRADITIONAL RO</span>
            <h3 className="text-display-md font-display text-white mb-6">
              Wastes Water.<br />Strips Minerals.
            </h3>
            <div className="space-y-4">
              {traditionalStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[0.875rem] mb-1">
                    <span className="text-[#A0A0A0]">{stat.label}</span>
                    <span className="font-mono" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A1A]">
                    <div className="h-full bg-[#E63946]" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SWORD */}
          <div
            className="relative p-8 md:p-12 min-h-[400px] flex flex-col justify-center"
            style={{
              background: 'linear-gradient(225deg, #0A1A1A 0%, rgba(46, 196, 182, 0.05) 100%)',
            }}
          >
            <span className="text-label text-[#2EC4B6] mb-3">SWORD SMART RO</span>
            <h3 className="text-display-md font-display text-white mb-6">
              Saves Water.<br />Retains Minerals.
            </h3>
            <div className="space-y-4">
              {swordStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[0.875rem] mb-1">
                    <span className="text-[#A0A0A0]">{stat.label}</span>
                    <span className="font-mono" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A1A]">
                    <div className="h-full bg-[#2EC4B6]" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Divider (on desktop) */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-white cursor-col-resize"
            style={{ transform: `translateX(-${50 - sliderPosition}%)` }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[rgba(10,10,10,0.8)] border-2 border-white flex items-center justify-center">
              <div className="flex gap-0.5">
                <ChevronDown size={12} className="text-white -rotate-90" />
                <ChevronDown size={12} className="text-white rotate-90" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Make the Switch <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Scene 7: Cinematic CTA Finale ───────────────────── */

function CtaFinaleScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[rgba(10,10,10,0.85)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
      </div>

      {/* Gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_60%)] z-[1] pointer-events-none" />

      <div className="container-sword relative z-10 text-center">
        {/* Headline mask reveal */}
        <motion.h2
          initial={{ clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
          animate={isInView ? { clipPath: 'inset(0 0% 0 0%)', opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-display-xl font-display text-white mb-6"
        >
          Experience the SWORD Difference
        </motion.h2>

        {/* Gold accent line */}
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: 120 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-[2px] bg-[#D4AF37] mx-auto mb-6"
          style={{ boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-body-lg text-[#A0A0A0] max-w-[600px] mx-auto mb-8"
        >
          India&apos;s first dual-membrane smart water purifier. AI-powered switching.
          Mineral retention. 60% water savings.
        </motion.p>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mb-8"
        >
          <p className="text-data-lg font-mono text-[#D4AF37] mb-1">
            ₹{products[0].price.toLocaleString('en-IN')}
          </p>
          <p className="text-[0.875rem] text-[#666666]">
            or ₹4,278/month for 12 months
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <Link to="/shop" className="btn-primary">
            Buy Now
          </Link>
          <Link to="/product/sword-smart-ro" className="btn-secondary">
            Learn More
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {[
            { icon: Truck, text: 'Free Shipping' },
            { icon: Shield, text: '2-Year Warranty' },
            { icon: Award, text: 'Doctor Recommended' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-[#A0A0A0]">
              <Icon size={18} className="text-[#D4AF37]" />
              <span className="text-label">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Features Grid ───────────────────── */

function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Brain,
      title: 'AI Smart Switching',
      desc: 'Y Divider intelligently routes water between NF and RO membranes based on real-time TDS readings. No manual intervention needed.',
      color: '#7B61FF',
    },
    {
      icon: Droplets,
      title: '60% Water Saved',
      desc: "Traditional RO wastes 80% of input water. SWORD's dual-membrane design reduces waste to just 20%, saving thousands of liters per year.",
      color: '#2EC4B6',
    },
    {
      icon: Gem,
      title: 'Essential Minerals Retained',
      desc: 'Unlike traditional RO that strips all minerals, SWORD retains 40% of natural calcium and magnesium, or adds them back via the Active Mineral cartridge.',
      color: '#FFD700',
    },
    {
      icon: Sliders,
      title: 'Custom TDS 80-300 ppm',
      desc: 'Set your desired TDS output via the TFT touchscreen or mobile app. SWORD auto-adjusts the NF/RO split to maintain your preference.',
      color: '#00B4D8',
    },
    {
      icon: Wifi,
      title: 'IoT + Mobile App',
      desc: 'Monitor TDS in real-time, track filter life, view water consumption analytics, and receive maintenance alerts — all from your smartphone.',
      color: '#00E5FF',
    },
    {
      icon: Calendar,
      title: '2x Filter Life (24+ Months)',
      desc: 'Smart switching reduces membrane load. Filters last up to 24 months, cutting maintenance costs by half compared to traditional RO.',
      color: '#D4AF37',
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-[#0A0A0A]">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">WHY SWORD</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Engineered for the Future of Water
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="glass-card p-6 hover:border-[rgba(212,175,55,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-400 group"
            >
              <feature.icon
                size={28}
                className="mb-4 group-hover:scale-110 transition-transform"
                style={{ color: feature.color }}
              />
              <h3 className="text-[1.125rem] font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-[0.875rem] text-[#A0A0A0] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Technical Specs ───────────────────── */

function TechnicalSpecs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const specs = [
    ['Purification Technology', 'Dual Membrane NF + RO with AI Switching'],
    ['Stages of Purification', '14'],
    ['TDS Reduction', 'Up to 95%'],
    ['Output TDS Range', '80-300 ppm (customizable)'],
    ['Water Recovery Rate', '80% (vs 20% traditional)'],
    ['Mineral Retention', '40% Ca, Mg retained'],
    ['Daily Purification Capacity', '15 liters/hour'],
    ['Storage Tank Capacity', '8 liters'],
    ['Operating Voltage', '24V DC, 2.5A'],
    ['Power Consumption', '60W'],
    ['Display', '2.4" TFT Touchscreen'],
    ['Connectivity', 'Wi-Fi 2.4GHz, Bluetooth 5.0'],
    ['App Compatibility', 'iOS 14+, Android 10+'],
    ['Noise Level', '< 35 dB'],
    ['Dimensions (WxHxD)', '280 x 450 x 180 mm'],
    ['Weight', '8.5 kg'],
    ['Certifications', 'BIS, ISO 9001, CE, RoHS'],
    ['Warranty', '2 Years Comprehensive'],
  ];

  return (
    <section ref={ref} className="py-24 bg-[#111111]">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">TECHNICAL SPECIFICATIONS</span>
          <h2 className="text-display-lg font-display text-white mb-4">
            Precision in Every Detail
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Specs Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-panel p-6"
          >
            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {specs.map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * index + 0.3 }}
                  className="flex py-3"
                >
                  <span className="w-1/2 text-[0.875rem] font-medium text-[#A0A0A0]">{key}</span>
                  <span className="w-1/2 text-[0.875rem] text-white">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-6"
          >
            {/* Flow Diagram */}
            <div className="glass-panel p-6">
              <h3 className="text-label text-white mb-4">14-STAGE FLOW</h3>
              <img
                src="/assets/product-flowchart.png"
                alt="14-stage purification flow diagram"
                className="w-full"
              />
            </div>

            {/* Certifications */}
            <div className="glass-panel p-6 text-center">
              <h3 className="text-label text-white mb-4">CERTIFIED & TRUSTED</h3>
              <img
                src="/certifications.png"
                alt="BIS, ISO, CE, RoHS certifications"
                className="w-full max-w-[400px] mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Reviews Carousel ───────────────────── */

function ReviewsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-[#0A0A0A]">
      <div className="container-sword">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">CUSTOMER REVIEWS</span>
          <div className="flex items-center justify-center gap-2 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < 5 ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#333333]'}
              />
            ))}
            <span className="text-[1.125rem] text-white font-medium ml-2">4.8 out of 5</span>
          </div>
          <p className="text-[0.875rem] text-[#666666]">Based on 1,247 reviews</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * index }}
              className="glass-panel p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.15 * index + i * 0.08 }}
                  >
                    <Star
                      size={14}
                      className={i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#333333]'}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-[0.875rem] text-white mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.875rem] font-medium text-white">{review.name}</p>
                  <p className="text-data-sm text-[#666666]">{review.location}</p>
                </div>
                {review.verified && (
                  <span className="text-[0.65rem] text-[#2EC4B6] border border-[#2EC4B6] px-2 py-0.5 uppercase">
                    Verified
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Pricing Section ───────────────────── */

function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { addToCart } = useCart();
  const [selectedEmi, setSelectedEmi] = useState(12);
  const heroProduct = products[0];

  const emiOptions = [
    { months: 3, amount: 15847 },
    { months: 6, amount: 8050 },
    { months: 9, amount: 5444 },
    { months: 12, amount: 4278 },
  ];

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-[#0A0A0A] to-[#111111] border-t border-[rgba(212,175,55,0.2)]"
    >
      <div className="container-sword">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
            className="flex items-center justify-center"
          >
            <img
              src={heroProduct.image}
              alt={heroProduct.name}
              className="max-w-[350px] w-full object-contain animate-float"
            />
          </motion.div>

          {/* Pricing Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="text-label text-[#D4AF37] mb-3 block">SWORD SMART RO</span>

            <motion.p
              className="text-data-lg font-mono text-[#D4AF37] mb-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              ₹{heroProduct.price.toLocaleString('en-IN')}
            </motion.p>
            <p className="text-[0.75rem] text-[#666666] mb-6">Inclusive of all taxes (GST 18%)</p>

            {/* EMI */}
            <div className="mb-6">
              <p className="text-[0.875rem] text-[#A0A0A0] mb-1">Easy EMIs starting at</p>
              <p className="text-data-md font-mono text-white">
                ₹{emiOptions.find((e) => e.months === selectedEmi)?.amount.toLocaleString('en-IN')}/month
              </p>
              <p className="text-[0.75rem] text-[#A0A0A0] mb-3">for {selectedEmi} months</p>
              <div className="flex gap-2">
                {emiOptions.map((emi) => (
                  <button
                    key={emi.months}
                    onClick={() => setSelectedEmi(emi.months)}
                    className={cn(
                      'px-3 py-1.5 text-[0.75rem] border rounded-full transition-all',
                      selectedEmi === emi.months
                        ? 'border-[#D4AF37] text-[#D4AF37]'
                        : 'border-[rgba(255,255,255,0.15)] text-[#A0A0A0] hover:border-[#D4AF37]'
                    )}
                  >
                    {emi.months}M
                  </button>
                ))}
              </div>
              <p className="text-[0.7rem] text-[#666666] mt-2">Powered by Razorpay</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={() =>
                  addToCart({
                    productId: heroProduct.id,
                    productName: heroProduct.name,
                    price: heroProduct.price,
                    image: heroProduct.image,
                  })
                }
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Add to Cart
              </button>
              <Link to="/checkout" className="btn-secondary w-full text-center">
                Buy Now
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, text: 'BIS Certified' },
                { icon: Calendar, text: '2-Year Warranty' },
                { icon: Truck, text: 'Free Installation' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[0.75rem] text-[#A0A0A0]">
                  <Icon size={16} className="text-[#D4AF37]" />
                  <span className="text-label">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── FAQ Section ───────────────────── */

function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How is SWORD different from traditional RO purifiers?',
      a: "SWORD uses a dual-membrane system (NF + RO) with AI-powered switching. Traditional RO removes all minerals and wastes 80% water. SWORD retains essential minerals, saves 60% water, and auto-adjusts based on your input water quality.",
    },
    {
      q: 'What is the customizable TDS feature?',
      a: 'You can set your desired output TDS between 80-300 ppm using the touchscreen display or mobile app. The AI adjusts the NF/RO split ratio to maintain your preferred TDS level automatically.',
    },
    {
      q: 'How often do I need to replace filters?',
      a: 'Thanks to smart switching that reduces membrane load, SWORD filters last up to 24 months — double the life of traditional RO filters. The app will notify you when replacements are due.',
    },
    {
      q: 'Is the SWORD Smart RO wall-mountable?',
      a: 'Yes, the SWORD Smart RO comes with a premium stainless steel wall-mount bracket included in the box. It can also be placed on a countertop using the optional stand accessory.',
    },
    {
      q: 'Does it work with all water sources (borewell, municipal, tanker)?',
      a: 'Absolutely. The AI TDS sensor automatically detects input water quality and adjusts purification accordingly. Whether your water is from borewell (high TDS), municipal supply (medium TDS), or tanker water, SWORD optimizes for the best output.',
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-[#0A0A0A]">
      <div className="container-sword max-w-[800px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-label text-[#D4AF37] mb-3 block">FAQ</span>
          <h2 className="text-display-lg font-display text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="border border-[rgba(255,255,255,0.06)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <span className="text-[0.875rem] font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'text-[#A0A0A0] flex-shrink-0 transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-[0.875rem] text-[#A0A0A0] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Newsletter Section ───────────────────── */

function NewsletterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubmitted(true); }
  };

  return (
    <section ref={ref} className="py-24 bg-[#111111]">
      <div className="container-sword max-w-[600px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="text-label text-[#D4AF37] mb-3 block">STAY UPDATED</span>
          <h2 className="text-display-md font-display text-white mb-4">
            Join the SWORD Community
          </h2>
          <p className="text-[#A0A0A0] mb-8">
            Get updates on new products, filter replacement reminders, and exclusive offers.
          </p>

          {submitted ? (
            <div className="glass-panel p-6">
              <div className="w-12 h-12 bg-[#2EC4B6] flex items-center justify-center mx-auto mb-3">
                <ChevronUp size={24} className="text-[#0A0A0A]" />
              </div>
              <p className="text-white font-medium">Thank you for subscribing!</p>
              <p className="text-[0.875rem] text-[#A0A0A0]">You&apos;ll hear from us soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 text-[0.875rem] placeholder-[#666666] focus:border-[#D4AF37] focus:shadow-[0_0_0_2px_rgba(212,175,55,0.15)] outline-none transition-all"
                required
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ HOME PAGE ═══════════════════════════ */

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <div className="bg-[#0A0A0A]">
      <LoadingScreen onComplete={() => setLoadingComplete(true)} />

      {loadingComplete && (
        <>
          {/* Scene 1: Hero */}
          <HeroScene />

          {/* Scene 2: Exploded Engineering */}
          <ExplodedViewScene />

          {/* Scene 3: Purification Journey */}
          <PurificationJourneyScene />

          {/* Scene 4: NF/RO Smart Switching */}
          <NfRoSwitchingScene />

          {/* Scene 5: Interactive Exploration */}
          <InteractiveExplorationScene />

          {/* Scene 6: Comparison */}
          <ComparisonScene />

          {/* Scene 7: CTA Finale */}
          <CtaFinaleScene />

          {/* Features Grid */}
          <FeaturesGrid />

          {/* Technical Specs */}
          <TechnicalSpecs />

          {/* Reviews */}
          <ReviewsSection />

          {/* Pricing */}
          <PricingSection />

          {/* FAQ */}
          <FaqSection />

          {/* Newsletter */}
          <NewsletterSection />
        </>
      )}
    </div>
  );
}
