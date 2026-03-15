import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Send, Paperclip, 
  ArrowRight, Globe, Shield, Boxes, ChevronDown, ArrowUp, Sparkles, Monitor
} from 'lucide-react';
import { LightBeamButton } from '../components/LightBeamButton';

// --- Sub-components ---

const CapsuleNavbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-[100] flex justify-between items-center">
      <div className="rotate-180-hover flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="icon-to-rotate bg-slate-500 p-2 rounded-xl">
          <Boxes size={24} className="text-white" />
        </div>
        <span className="font-space text-xl font-bold text-white">citybuddy</span>
      </div>

      <div className="glass-soft flex gap-8 px-8 py-3 rounded-full text-white/70 text-sm font-medium">
        <button onClick={() => navigate('/twin')} className="hover:text-white transition-colors cursor-pointer">Digital Twin</button>
        <button onClick={() => navigate('/citizen')} className="hover:text-white transition-colors cursor-pointer">Citizen Dashboard</button>
        <button onClick={() => navigate('/traffic')} className="hover:text-white transition-colors cursor-pointer">Traffic AI</button>
      </div>

      <button 
        onClick={() => navigate('/twin')}
        className="px-6 py-3 bg-white text-primary-dark rounded-full font-bold cursor-pointer shadow-lg hover:scale-105 transition-transform"
      >
        Sign In
      </button>
    </nav>
  );
};

const FeatureCard = ({ title, description, badge, visual, reversed }) => {
  return (
    <div className={`flex flex-col lg:flex-row ${reversed ? 'lg:flex-row-reverse' : ''} items-center gap-10 lg:gap-20 py-20`}>
      <div className="flex-1 w-full">
        <div className="text-brand-indigo font-bold text-sm mb-4 flex items-center gap-2">
          <Shield size={16} /> {badge}
        </div>
        <h2 className="font-cormorant text-5xl font-semibold mb-6 text-primary-dark">{title}</h2>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">{description}</p>
        <button className="flex items-center gap-2 text-primary-dark font-bold text-base cursor-pointer hover:translate-x-1 transition-transform">
          Explore documentation <ArrowRight size={20} />
        </button>
      </div>
      <div className="flex-1 w-full">
        {visual}
      </div>
    </div>
  );
};

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 bg-slate-100 rounded-2xl flex justify-between items-center cursor-pointer text-left hover:bg-slate-200 transition-colors"
      >
        <span className="text-lg font-semibold text-primary-dark">{question}</span>
        <ChevronDown size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[200px] py-5 px-6' : 'max-h-0 px-6'}`}>
        <p className="text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// --- Page Component ---

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const fullSubheading = 'The precision operating system for modern urban environments.';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullSubheading.slice(0, i));
      i++;
      if (i > fullSubheading.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section (110vh) */}
      <section className="h-[110vh] relative overflow-hidden bg-[#0a0a0f]">
        {/* Background Images Layer */}
        <div className="absolute inset-0 z-0">
          <div className="h-1/2 w-full bg-[#111a24]">
            {/* Color replaces the red.jpg image */}
          </div>
          <div className="absolute bottom-0 h-1/2 w-full">
            <img src="/sc.jpg" className="w-full h-full object-cover" alt="" />
            {/* Black overlay on second image */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
          {/* Dark Overlay to blend */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-transparent to-transparent opacity-80" />
        </div>

        {/* Parallax Text Layer */}
        <div 
          className="absolute inset-0 z-1 flex items-center justify-center pointer-events-none select-none transition-transform duration-75 ease-out"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
          <h2 className="text-[15rem] lg:text-[16rem] font-bold text-white/[0.3] tracking-tighter uppercase whitespace-nowrap font-inter">
            smartcity
          </h2>
        </div>

        <div className="grid-overlay absolute inset-0 z-2 opacity-30" />
        <CapsuleNavbar />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-start pt-32 lg:pt-48 text-center px-5">
          {/* Announcement Pill */}
          {/* <div className="mb-10 animate-fade-in-up">
            <div className="glass-soft px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[0.8rem] font-medium text-white/80 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="bg-brand-indigo text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">New</span>
              <span>Superdesign Mobile for iPhone is here</span>
              <ArrowRight size={14} className="text-white/40" />
            </div>
          </div> */}

          <h1 className="text-5xl lg:text-8xl font-cormorant text-white tracking-tight leading-tight">
             Your City, Perfectly Echoed
          </h1>

          <p className="text-base md:text-lg text-white/95 font-extralight mt-4 max-w-[600px] leading-relaxed">
            Build high-fidelity digital twins and <span className="text-white/80 border-b border-white/20 pb-0.5">monitor autonomous dynamics</span> in real-time.
          </p>

          <div className="mt-40 flex flex-wrap justify-center gap-6">
            <LightBeamButton onClick={() => navigate('/twin')}>
              Launch City Engine <Monitor size={18} />
            </LightBeamButton>
            
            <LightBeamButton 
              className="bg-white/5 border-white/5 hover:bg-white/10" 
              gradientColors={["#ffffff20", "#ffffff40", "#ffffff20"]}
            >
              Watch Reality Demo
            </LightBeamButton>
          </div>
          {/* <VibeInput /> */}
          
          <div className="mt-20 flex flex-col items-center gap-6">
             <div className="flex gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <img src="/icons.svg" className="h-6" alt="" />
             </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Section (Scroll-Spy) */}
      <section id="features" className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-5 lg:flex gap-20">
          {/* Sticky Sidebar */}
          <div className="hidden lg:block w-[250px] shrink-0">
            <div className="sticky top-[100px]">
              <h4 className="font-space text-[0.8rem] font-bold text-slate-400 uppercase mb-6 tracking-wider">Architecture</h4>
              <div className="flex flex-col gap-1">
                <a href="#twin" className="group flex items-center gap-3 py-3 text-slate-400 font-medium hover:text-primary-dark transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary-dark transition-colors" /> Digital Twin Core
                </a>
                <a href="#agents" className="group flex items-center gap-3 py-3 text-slate-400 font-medium hover:text-primary-dark transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary-dark transition-colors" /> Monitor Agents
                </a>
                <a href="#data" className="group flex items-center gap-3 py-3 text-slate-400 font-medium hover:text-primary-dark transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary-dark transition-colors" /> Data Integration
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <FeatureCard 
              badge="Visualization"
              title="Next-Gen 3D Map Engine"
              description="High-fidelity rendering of city infrastructure powered by OSM data. Real-time topology, building footprints, and road networks unified into a single digital double."
              visual={
                <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-200">
                  <div className="h-[300px] w-full bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-brand-indigo opacity-20" />
                    <div className="text-center">
                      <Map size={64} className="text-brand-indigo opacity-60 mx-auto" />
                      <div className="font-space text-white mt-3 text-[0.8rem] opacity-40">OSM_LAYER_RENDERER</div>
                    </div>
                  </div>
                </div>
              }
            />
            <FeatureCard 
              badge="Intelligence"
              title="Autonomous Monitor Agents"
              description="Deploy AI agents that watch your city 24/7. Detect anomalies in traffic flow, weather patterns, and infrastructure health with zero latency."
              reversed
              visual={
                <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-200">
                   <div className="h-[300px] w-full bg-primary-dark rounded-2xl p-6 overflow-hidden">
                      <div className="flex gap-3 mb-5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      </div>
                      <div className="font-space text-emerald-500 text-[0.9rem] leading-relaxed">
                        {`> RUN agent_monitor.sh`} <br/>
                        {`> [INFO] Scanning district 4...`} <br/>
                        {`> [WARN] High traffic detected at L-32`} <br/>
                        {`> [OK] Emergency services standby.`}
                      </div>
                   </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* 3. Testimonials (Glass Masonry) */}
      <section id="testimonials" className="bg-primary-dark py-24 lg:py-32 px-5">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-cormorant text-5xl lg:text-[3.5rem] leading-tight text-white text-center mb-20">Built for the <span className="text-brand-indigo">boldest planners.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="The most intuitive urban planning tool I've used in a decade. The AI agents are a game-changer for monitoring."
              author="Elena Rosetti"
              role="Urban Architect, Milan"
            />
            <TestimonialCard 
              quote="Integration with existing data sources was seamless. CityBuddy OS transformed how we view municipal health."
              author="Marcus Thorne"
              role="Director of Smart Cities, Austin"
            />
            <TestimonialCard 
              quote="A masterpiece in visualization. It's not just a map—it's a living, breathing digital double."
              author="Sita Verma"
              role="Civil Engineer, Bengaluru"
            />
          </div>
        </div>
      </section>

      {/* 4. FAQ (Accordion) */}
      <section id="faq" className="py-24 lg:py-32 px-5 bg-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-5xl font-semibold text-primary-dark mb-4">Common Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know about the CityBuddy ecosystem.</p>
          </div>
          
          <AccordionItem 
            question="Where does the map data come from?" 
            answer="We primarily utilize OpenStreetMap (OSM) for infrastructure and roads, enriched with global elevation data from Open-Meteo."
          />
          <AccordionItem 
            question="How do AI agents work?" 
            answer="Agents operate on a 'Monitor-Process-Alert' loop, analyzing live sensor feeds and providing insights via the dashboard."
          />
          <AccordionItem 
            question="Can I export the simulation data?" 
            answer="Yes, all graph and sensor data can be exported in JSON or CSV formats for further analysis in professional GIS tools."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-5 border-t border-slate-200 text-center">
        <div className="rotate-180-hover inline-flex items-center gap-2 mb-8 cursor-pointer group">
          <Boxes size={32} className="icon-to-rotate text-brand-indigo" />
          <span className="font-space text-2xl font-bold">citybuddy</span>
        </div>
        <p className="text-slate-500 text-base">© 2026 Urban Intelligence Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="glass-strong p-10 rounded-[32px] text-white">
      <p className="text-lg leading-relaxed text-slate-100 mb-8 italic">"{quote}"</p>
      <div>
        <div className="font-semibold text-lg">{author}</div>
        <div className="text-sm text-white/50">{role}</div>
      </div>
    </div>
  );
}
