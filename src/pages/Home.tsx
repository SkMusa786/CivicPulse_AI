import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Complaint } from '../types';
import {
  Camera,
  Cpu,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Search,
  CheckCheck,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Leaf,
  Lightbulb,
  Fence,
  Palette,
} from 'lucide-react';

export const Home: React.FC = () => {
  const recentComplaints: Complaint[] = [];

  const steps = [
    {
      num: '01',
      title: 'Snap & Upload Photograph',
      desc: 'Take a photo of any civic defect—potholes, garbage, unlit streetlights, or burst water mains.',
      icon: Camera,
    },
    {
      num: '02',
      title: 'AI Vision Diagnosis',
      desc: 'CivicAI instantly analyzes the image, categorizes severity, and drafts the technical grievance report.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Automated Agency Routing',
      desc: 'Verified reports are instantly dispatched to the responsible municipal department work order queue.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Photographic Proof & Closure',
      desc: 'City crews upload before-and-after photographs upon completing repair. Citizens receive email closure alerts.',
      icon: CheckCheck,
    },
  ];

  const problemCategories = [
    { title: 'Roads & Pavements', count: '3,840+ resolved', desc: 'Potholes, broken curbs, sinkholes & cave-ins' },
    { title: 'Garbage & Sanitation', count: '4,120+ resolved', desc: 'Dumpster overflows, illegal dumping & odor' },
    { title: 'Street Lighting', count: '2,490+ resolved', desc: 'Dark corridors, luminaire faults & exposed wiring' },
    { title: 'Water Supply & Sewage', count: '1,980+ resolved', desc: 'Pipeline ruptures, open drains & valve leaks' },
    { title: 'Parks & Public Spaces', count: '890+ resolved', desc: 'Fallen trees, broken playground gear & turf' },
    { title: 'Traffic & Signage', count: '1,160+ resolved', desc: 'Missing stop signs, damaged signals & bollards' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen Municipal Computer Vision</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance leading-[1.12]">
                Report Civic Issues. <br />
                <span className="text-blue-600">Build Better Communities.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                AI-powered civic issue reporting that connects citizens directly with municipal authorities. Simply snap a photograph—CivicAI identifies the problem, drafts the grievance report, and tracks verified resolution proof.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/citizen/report"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report an Issue Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/citizen/track"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>Track Complaint Status</span>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Manual Form Filling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>GPS Geotagging & Leaflet Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Photographic Resolution Proof</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                {/* Simulated AI Vision Inspection Frame */}
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                    alt="Civic defect detection preview"
                    className="w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />

                  {/* AI Detection Bounding Box overlay */}
                  <div className="absolute inset-8 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <div className="self-start bg-blue-600 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>POTHOLE_DEFECT (96.4% CONFIDENCE)</span>
                    </div>
                    <div className="self-end bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded">
                      SEVERITY: HIGH · SLA: 24H
                    </div>
                  </div>

                  {/* Real-time status badge bottom */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs rounded-lg p-3 shadow-md border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Auto-Routed to Public Works</p>
                        <p className="text-[11px] text-slate-500">Ward 14 · Work Order #WO-409</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      In Progress
                    </span>
                  </div>
                </div>

                <div className="p-3 text-xs text-slate-500 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">Model: CivicAI-Vision v4.2</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <span>Inspect Workflow</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-blue-400 tabular-nums">98.4%</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">AI Classification Accuracy</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">4.2 Hrs</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Average Response Time</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">12,480+</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Verified Issues Resolved</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-400 tabular-nums">96.8%</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">Resident Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step "How CivicAI Works" */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Seamless 4-Step Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              How CivicAI Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From an uploaded camera snapshot to verified on-ground repair with photographic proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">{st.num}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{st.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SpotGuard Proactive Shield Feature Section */}
      <section className="py-16 sm:py-20 bg-linear-to-b from-slate-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Innovation: Proactive Prevention</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Don't Wait for Empty Corners to Become Dump Yards. <br />
                <span className="text-teal-300">Protect Them Before Nuisance Happens.</span>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Most civic apps only let you complain after a spot is already ruined with garbage and public urination. With <b>CivicAI SpotGuard</b>, take a photograph of any vulnerable compound wall, empty plot, or dark corner outside your house. Our AI suggests dense green hedges, low-cost fencing, solar motion lighting, and wall murals—transforming vulnerable spaces into clean neighborhood gardens.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Leaf className="w-4 h-4 text-emerald-400 mb-1" />
                  <p className="font-bold text-white">Green Hedges</p>
                  <p className="text-[11px] text-slate-400">Thorny & dense</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Lightbulb className="w-4 h-4 text-amber-400 mb-1" />
                  <p className="font-bold text-white">Motion Lighting</p>
                  <p className="text-[11px] text-slate-400">PIR solar sensor</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Fence className="w-4 h-4 text-blue-400 mb-1" />
                  <p className="font-bold text-white">Low-Cost Fences</p>
                  <p className="text-[11px] text-slate-400">Pallet & planters</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Palette className="w-4 h-4 text-purple-400 mb-1" />
                  <p className="font-bold text-white">Wall Murals</p>
                  <p className="text-[11px] text-slate-400">90%+ deterrent</p>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/citizen/spotguard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-sm shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try SpotGuard AI Spot Shield</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Transformation Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs p-3 shadow-2xl">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
                    alt="Beautified spot preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow">
                    AI BEAUTIFICATION BLUEPRINT
                  </div>
                </div>
                <div className="p-2 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-teal-200">
                    <span>94% Waste Deterrence Projected</span>
                    <span className="font-mono">Est. $25 DIY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Compound wall corner transformed with Sansevieria green hedge & solar PIR sensor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Categories Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Municipal Jurisdictions
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Types of Civic Problems We Solve
              </h2>
            </div>
            <Link
              to="/citizen/report"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Browse all categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {cat.title}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {cat.count}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Recent Issues Feed */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Community Transparency
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Recent Civic Reports</h2>
            </div>
            <Link
              to="/citizen/my-complaints"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentComplaints.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="relative aspect-video bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    {item.id}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[150px]">{item.location.address}</span>
                    <Link
                      to={`/citizen/track?id=${item.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Spot a Civic Problem in Your Neighborhood?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of active residents improving our roads, sanitation, lighting, and public safety with automated AI grievance filing.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/citizen/report"
              className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue (Instant AI)</span>
            </Link>
            <Link
              to="/citizen/track"
              className="px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm border border-blue-500 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Existing Grievance</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CivicAI Platform</span>
            <span>·</span>
            <span>Municipal Grievance Redressal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by Computer Vision & Geocoding</span>
            <span>·</span>
            <Link to="/citizen/dashboard" className="hover:text-blue-600">Citizen</Link>
            <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
            <Link to="/department/dashboard" className="hover:text-blue-600">Departments</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
