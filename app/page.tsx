"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSmartphone, FiShield, FiMonitor, FiDownload, FiUsers, FiZap, FiArrowRight, FiTerminal, FiEye, FiRadio, FiServer, FiActivity, FiCpu, FiLock, FiGlobe, FiClock, FiTrendingUp, FiAlertCircle, FiCheck, FiCodesandbox } from "react-icons/fi";

function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const i = useRef(0);

  useEffect(() => {
    i.current = 0;
    setDisplayed("");
    setDone(false);
    const timer = setInterval(() => {
      i.current++;
      setDisplayed(text.slice(0, i.current));
      if (i.current >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

function AnimatedTerminal() {
  const lines = [
    { text: "$ ./deploy --target=android --silent", delay: 0 },
    { text: "> Initializing secure channel...", delay: 1200 },
    { text: "> Binding to device: ●●●●●●●●●●●●", delay: 2400 },
    { text: "> Token authenticated: 0x7F::DE:AD:BE:EF", delay: 3600 },
    { text: "> Connection established | latency: 12ms", delay: 4800 },
    { text: "> Data pipeline ACTIVE: SMS | CONTACTS | CALLS | FILES", delay: 6000 },
    { text: "", delay: 6200 },
    { text: "  ╔══════════════════════════════════════╗", delay: 6400 },
    { text: "  ║  STATUS:  ONLINE  ●  encrypted      ║", delay: 6600 },
    { text: "  ║  UPLINK:  ACTIVE  ●  3.4MB buffered ║", delay: 6800 },
    { text: "  ║  GPS:     DISABLED●  safe mode      ║", delay: 7000 },
    { text: "  ╚══════════════════════════════════════╝", delay: 7200 },
  ];

  return (
    <div className="w-full max-w-lg mx-auto rounded-xl border border-emerald-500/30 bg-black/80 backdrop-blur p-4 font-mono text-xs leading-relaxed shadow-[0_0_30px_rgba(52,211,153,0.15)]">
      <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-emerald-400/60 ml-2 text-[10px]">terminal — device-panel v3.2.1</span>
      </div>
      <div className="space-y-0.5">
        {lines.map((line, idx) => (
          <TypedLine key={idx} text={line.text} delay={line.delay} />
        ))}
      </div>
    </div>
  );
}

function TypedLine({ text, delay }: { text: string; delay: number }) {
  const { displayed, done } = useTypingEffect(text, 25);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return <div className="h-[18px]" />;
  return (
    <div className="h-[18px]">
      <span className="text-emerald-300">
        {displayed}
        {!done && <span className="animate-pulse">▊</span>}
      </span>
    </div>
  );
}

function LiveDataFeed() {
  const [items] = useState([
    { type: "SMS", from: "+1 (555) 234-8901", preview: "Confirmation code: 7492...", time: "2s ago" },
    { type: "SMS", from: "+91 98765 43210", preview: "Meeting at 3pm, don't forget...", time: "7s ago" },
    { type: "CALL", from: "(212) 555-0198", preview: "Incoming · 3m 12s", time: "15s ago" },
    { type: "SMS", from: "+44 7700 900123", preview: "Your OTP is 38291 — valid for...", time: "23s ago" },
    { type: "CONTACT", from: "SYNC", preview: "47 contacts uploaded", time: "31s ago" },
    { type: "CALL", from: "+1 (415) 555-2671", preview: "Missed · 0m 0s", time: "42s ago" },
    { type: "SMS", from: "+49 151 23456789", preview: "Package delivered to pickup...", time: "55s ago" },
    { type: "FILE", from: "/DCIM/Camera", preview: "IMG_20240312_142309.jpg", time: "1m ago" },
    { type: "CALL", from: "+81 90-1234-5678", preview: "Outgoing · 8m 47s", time: "2m ago" },
  ]);

  const colorMap: Record<string, string> = {
    SMS: "text-cyan-400",
    CALL: "text-amber-400",
    CONTACT: "text-emerald-400",
    FILE: "text-violet-400",
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-xl border border-cyan-500/20 bg-black/60 backdrop-blur p-3">
      <div className="flex items-center justify-between mb-2 border-b border-cyan-500/10 pb-2">
        <span className="text-[10px] font-mono text-cyan-400/70 flex items-center gap-1.5">
          <FiRadio className="h-2.5 w-2.5 animate-pulse" /> LIVE FEED
        </span>
        <span className="text-[10px] font-mono text-cyan-400/40">● recording</span>
      </div>
      <div className="space-y-1 max-h-[260px] overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] font-mono border-b border-white/5 pb-1 last:border-0">
            <span className={`shrink-0 w-10 ${colorMap[item.type] || "text-gray-400"}`}>
              [{item.type}]
            </span>
            <span className="text-gray-400 truncate flex-1">{item.from}</span>
            <span className="text-gray-500 truncate max-w-[80px]">{item.preview}</span>
            <span className="text-gray-600 shrink-0 w-10 text-right">{item.time}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-1 border-t border-cyan-500/10">
        <span className="text-[10px] font-mono text-emerald-500/60 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Capturing — 1,247 records synced
        </span>
      </div>
    </div>
  );
}

function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789DEVICE MONITOR SYSTEM";
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(52, 211, 153, 0.08)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" />;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <MatrixBackground />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/90 border-b border-emerald-500/20 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-950/50 group-hover:bg-emerald-900/50 transition-colors">
              <FiEye className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-emerald-400 font-mono tracking-wider">// PANEL</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how" },
              { label: "Dashboard", href: "/dashboard" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-mono tracking-wide">
                [{item.label}]
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-mono">
              $ login
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-emerald-500/50 bg-emerald-950/30 px-4 py-2 text-sm font-mono text-emerald-300 hover:bg-emerald-900/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all"
            >
              deploy →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 pb-10 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-black pointer-events-none" />
        <div className="relative mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400/80 tracking-widest">SYSTEM ACTIVE — v3.2.1</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                  Monitor Android
                </span>
                <br />
                <span className="text-white/90">Devices in Real-Time</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-lg font-mono leading-relaxed">
                Deploy silently. Capture SMS, contacts, call logs, and files. 
                All data streams to your secure dashboard with zero trace on the target device.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-sm font-mono text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_30px_rgba(52,211,153,0.25)] transition-all"
                >
                  <FiTerminal className="h-4 w-4" />
                  Initialize Deployment
                  <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how"
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors font-mono flex items-center gap-1.5"
                >
                  <FiEye className="h-4 w-4" />
                  view documentation
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-xs font-mono text-gray-600">
                <span className="flex items-center gap-1.5"><FiCheck className="h-3 w-3 text-emerald-500" /> No root required</span>
                <span className="flex items-center gap-1.5"><FiCheck className="h-3 w-3 text-emerald-500" /> Silent deployment</span>
                <span className="flex items-center gap-1.5"><FiCheck className="h-3 w-3 text-emerald-500" /> Live encryption</span>
              </div>
            </div>

            <div className="space-y-6">
              <AnimatedTerminal />
              <LiveDataFeed />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-[10px] font-mono tracking-widest">SCROLL_DOWN</span>
          <div className="h-8 w-5 rounded-full border border-gray-700 flex justify-center pt-1">
            <div className="h-1.5 w-1 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-emerald-900/30 bg-black/80 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99.8%", label: "Uptime", icon: FiServer },
              { value: "<12ms", label: "Avg Latency", icon: FiActivity },
              { value: "AES-256", label: "Encryption", icon: FiLock },
              { value: "24/7", label: "Monitoring", icon: FiClock },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-4 w-4 text-emerald-500/60 mx-auto mb-2" />
                <div className="text-xl font-bold font-mono text-emerald-400">{stat.value}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-950/20 px-4 py-1 mb-4">
              <span className="text-xs font-mono text-emerald-500/60">// DEPLOYMENT_PROTOCOL</span>
            </div>
            <h2 className="text-4xl font-bold font-mono">
              <span className="text-emerald-400">Three-Step</span>{" "}
              <span className="text-gray-300">Deployment</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Generate Token",
                desc: "Create a unique access token from the admin panel. Each deployment uses an isolated key linked to your account.",
                icon: FiShield,
                details: "256-bit | auto-expire | rate-limited",
              },
              {
                step: "02",
                title: "Deploy APK",
                desc: "Download the customized APK with your token pre-embedded. Install on target — zero configuration needed.",
                icon: FiDownload,
                details: "7MB | signed | obfuscated",
              },
              {
                step: "03",
                title: "Monitor Feed",
                desc: "Access all device data through the live dashboard. SMS, contacts, call logs, and files stream in real-time.",
                icon: FiMonitor,
                details: "auto-refresh | encrypted | exportable",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-xl border border-emerald-900/30 bg-black/60 p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(52,211,153,0.08)] transition-all duration-500"
              >
                <div className="absolute top-0 right-0 text-[80px] font-mono font-bold text-emerald-950/20 select-none leading-none pr-3">
                  {item.step}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 mb-5 group-hover:bg-emerald-900/40 group-hover:scale-110 transition-all">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-mono text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-mono">{item.desc}</p>
                <div className="mt-4 text-[10px] font-mono text-emerald-600/60 tracking-wider">
                  {item.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6 border-t border-emerald-900/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-950/20 px-4 py-1 mb-4">
              <span className="text-xs font-mono text-emerald-500/60">// CAPABILITIES</span>
            </div>
            <h2 className="text-4xl font-bold font-mono">
              <span className="text-emerald-400">Full</span>{" "}
              <span className="text-gray-300">Data Acquisition</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "SMS Capture", desc: "All incoming and outgoing messages with sender, body, and timestamps. Live feed updates within 3 seconds.", icon: FiSmartphone, tag: "LIVE" },
              { title: "Contact Harvest", desc: "Full address book extraction with names, phone numbers, and email addresses. Syncs automatically.", icon: FiUsers, tag: "AUTO" },
              { title: "Call Log Intelligence", desc: "Detailed call history — inbound, outbound, missed. Duration, frequency, and contact mapping.", icon: FiActivity, tag: "ANALYTICS" },
              { title: "File System Access", desc: "Browse and retrieve files from device storage. Images, documents, and any accessible data.", icon: FiDownload, tag: "DEEP" },
              { title: "Token Isolation", desc: "Each deployment is cryptographically isolated. Data accessible only by the token owner.", icon: FiLock, tag: "SECURE" },
              { title: "Admin Suite", desc: "Central management console with cross-device overview, token lifecycle, and access control.", icon: FiServer, tag: "CONTROL" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-emerald-900/30 bg-black/50 p-6 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.06)] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 group-hover:bg-emerald-900/30 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600/50 tracking-widest">{feature.tag}</span>
                </div>
                <h3 className="font-semibold font-mono text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Terminal */}
      <section className="relative py-24 px-6 border-t border-emerald-900/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-950/20 px-4 py-1 mb-4">
              <span className="text-xs font-mono text-emerald-500/60">// DEMO_INTERFACE</span>
            </div>
            <h2 className="text-4xl font-bold font-mono">
              <span className="text-emerald-400">Live</span>{" "}
              <span className="text-gray-300">Dashboard Preview</span>
            </h2>
          </div>
          <div className="rounded-xl border border-emerald-900/30 bg-black/80 backdrop-blur overflow-hidden shadow-[0_0_50px_rgba(52,211,153,0.05)]">
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-emerald-900/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-gray-500 ml-3">dashboard — device-panel</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-gray-600">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 12 online</span>
                <span>3 offline</span>
              </div>
            </div>
            {/* Terminal body */}
            <div className="grid md:grid-cols-3 gap-px bg-emerald-900/10">
              <div className="p-4 border-r border-emerald-900/10">
                <div className="text-[10px] font-mono text-emerald-500/50 mb-3 tracking-wider">DEVICE_STATUS</div>
                <div className="space-y-2">
                  {["Pixel 9 Pro", "Galaxy S24", "Redmi Note 13", "OnePlus 12", "iPhone 15"].map((device, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">{device}</span>
                      <span className="flex items-center gap-1 text-emerald-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        online
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-r border-emerald-900/10">
                <div className="text-[10px] font-mono text-emerald-500/50 mb-3 tracking-wider">DATA_STREAM</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between"><span className="text-gray-400">SMS collected</span><span className="text-cyan-400">2,847</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Contacts</span><span className="text-emerald-400">1,203</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Call logs</span><span className="text-amber-400">4,591</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Files indexed</span><span className="text-violet-400">12.4k</span></div>
                  <div className="flex justify-between pt-2 border-t border-emerald-900/10"><span className="text-gray-300">Total size</span><span className="text-white">3.2 GB</span></div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-mono text-emerald-500/50 mb-3 tracking-wider">RECENT_ACTIVITY</div>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="text-cyan-400/80">&gt; SMS received — +1 (555) 234-8901</div>
                  <div className="text-amber-400/80">&gt; Call log updated — 3m 12s</div>
                  <div className="text-emerald-400/80">&gt; Contact sync complete — 47 new</div>
                  <div className="text-violet-400/80">&gt; File uploaded — IMG_0392.jpg</div>
                  <div className="text-gray-500">&gt; Heartbeat — all systems nominal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 border-t border-emerald-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-black/60 p-12 text-center shadow-[0_0_60px_rgba(52,211,153,0.05)]">
            <FiCodesandbox className="h-12 w-12 text-emerald-500/30 mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-mono mb-4">
              <span className="text-emerald-400">Ready</span>{" "}
              <span className="text-white">to Deploy?</span>
            </h2>
            <p className="text-gray-400 font-mono text-sm max-w-lg mx-auto mb-8">
              Initialize your first monitoring node. Full dashboard access, real-time data streaming, and zero traces on target.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-8 py-3.5 font-mono text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_40px_rgba(52,211,153,0.2)] transition-all"
            >
              <FiTerminal className="h-4 w-4" />
              $ deploy --init
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-900/20 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-mono text-gray-600">
              <FiEye className="h-4 w-4 text-emerald-600" />
              // PANEL — Advanced Device Monitoring Platform
            </div>
            <div className="flex items-center gap-6 text-xs font-mono text-gray-700">
              <span>© 2026</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                system operational
              </span>
              <span>v3.2.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
