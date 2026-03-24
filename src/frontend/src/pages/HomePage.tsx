import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Globe,
  Link2,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Share2,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { LocationEntry } from "../backend";
import { useCreateRequest, useGetEntries } from "../hooks/useQueries";

declare const L: any;

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString();
}

const NAV_LINKS = ["Home", "How it Works", "Features", "Business", "Help"];

const FEATURES = [
  {
    icon: Link2,
    step: "01",
    title: "Create a Link",
    desc: "Generate a unique, secure link in seconds. No account required for recipients.",
    color: "bg-blue-50 text-primary",
  },
  {
    icon: Share2,
    step: "02",
    title: "Share Access",
    desc: "Send the link via WhatsApp, SMS, or email. Recipients grant permission with one tap.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MapIcon,
    step: "03",
    title: "View on Map",
    desc: "See all collected locations pinned on an interactive map in real time.",
    color: "bg-green-50 text-green-600",
  },
];

const MAP_PINS = [
  { top: "25%", left: "20%", label: "Sara" },
  { top: "55%", left: "55%", label: "Bilal" },
  { top: "35%", left: "70%", label: "Nadia" },
];

const PHONE_PINS = [
  { top: "30%", left: "45%" },
  { top: "55%", left: "60%" },
  { top: "65%", left: "30%" },
];

const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    role: "Event Organizer",
    text: "I use LocateLink to track my team during outdoor events. It's incredibly simple — just send a link and see everyone on the map!",
    initials: "AK",
  },
  {
    name: "Omar Farooq",
    role: "Delivery Manager",
    text: "Managing 20 delivery riders was a nightmare. LocateLink made it effortless. No app installation, just a link.",
    initials: "OF",
  },
  {
    name: "Zara Hussain",
    role: "Parent",
    text: "I share a location link with my kids before school trips. Peace of mind knowing I can see where they are.",
    initials: "ZH",
  },
];

const FOOTER_COLS = [
  { title: "Product", links: ["Features", "How it Works", "Pricing", "API"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
];

function createToken() {
  return crypto.randomUUID();
}

function LiveDashboard({
  token,
  shareableLink,
  copied,
  onCopy,
}: {
  token: string;
  shareableLink: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const { data: entries = [], refetch, isFetching } = useGetEntries(token);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const id = setInterval(() => refetch(), 10000);
    return () => clearInterval(id);
  }, [refetch]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    if (typeof L === "undefined") return;

    const map = L.map(mapRef.current, {
      center: [30.3753, 69.3451],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
    markersLayer.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      leafletMap.current = null;
      markersLayer.current = null;
    };
  }, []);

  // Update markers when entries change
  useEffect(() => {
    if (
      !leafletMap.current ||
      !markersLayer.current ||
      typeof L === "undefined"
    )
      return;

    markersLayer.current.clearLayers();
    if (entries.length === 0) return;

    const bounds: [number, number][] = [];

    for (const entry of entries) {
      const lat = Number(entry.lat);
      const lng = Number(entry.lng);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:#2F6FEF;color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(47,111,239,0.4);font-family:'Plus Jakarta Sans',sans-serif;">${entry.labelText || "Guest"}</div>`,
        iconAnchor: [40, 12],
      });

      L.marker([lat, lng], { icon })
        .bindPopup(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:140px;"><strong style="font-size:13px;">${entry.labelText || "Guest"}</strong><br/><span style="font-size:11px;color:#6B7280;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/><span style="font-size:11px;color:#6B7280;">${formatTime(entry.timestamp)}</span></div>`,
        )
        .addTo(markersLayer.current);

      bounds.push([lat, lng]);
    }

    if (bounds.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [entries]);

  return (
    <motion.section
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background border-b border-border"
      data-ocid="dashboard.panel"
    >
      {/* Dashboard header */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-bold text-foreground">Live Locations</span>
          </div>
          <Badge
            variant="secondary"
            className="text-xs"
            data-ocid="dashboard.count.card"
          >
            <Users className="w-3 h-3 mr-1" />
            {entries.length} {entries.length === 1 ? "person" : "people"}
          </Badge>
          {isFetching && (
            <Badge
              variant="outline"
              className="text-xs"
              data-ocid="dashboard.loading_state"
            >
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Updating...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code className="hidden sm:block text-xs bg-accent border border-border rounded-lg px-3 py-1.5 text-muted-foreground max-w-xs truncate font-mono">
            {shareableLink}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={onCopy}
            data-ocid="dashboard.copy_link.button"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            data-ocid="dashboard.refresh.button"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Map + List */}
      <div className="max-w-7xl mx-auto px-6 pb-6 flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div className="flex-1 min-h-[320px] relative rounded-xl overflow-hidden border border-border">
          <div ref={mapRef} className="absolute inset-0" />
          {entries.length === 0 && !isFetching && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-accent/80 backdrop-blur-sm"
              data-ocid="dashboard.empty_state"
            >
              <MapPin className="w-10 h-10 text-primary/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No locations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Share the link — locations will appear here
              </p>
            </div>
          )}
        </div>

        {/* Entry list */}
        <div className="w-full lg:w-72 border border-border rounded-xl bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Location Entries
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-72 lg:max-h-[290px]">
            {entries.length === 0 ? (
              <div
                className="p-6 text-center"
                data-ocid="dashboard.list.empty_state"
              >
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {entries.map((entry: LocationEntry, i: number) => (
                  <motion.li
                    key={`${entry.labelText}-${entry.lat}-${entry.lng}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-3 hover:bg-accent/50 transition-colors"
                    data-ocid={`dashboard.entry.item.${i + 1}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">
                          {(entry.labelText || "G").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {entry.labelText || "Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(entry.lat).toFixed(4)},{" "}
                          {Number(entry.lng).toFixed(4)}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createRequest = useCreateRequest();

  const shareableLink = generatedToken
    ? `${window.location.origin}/#/share/${generatedToken}`
    : null;

  async function handleCreateLink() {
    const token = createToken();
    await createRequest.mutateAsync({ token, label: "Location Request" });
    setGeneratedToken(token);
    toast.success("Link created! Share it to collect locations.");
  }

  async function handleCopy() {
    if (!shareableLink) return;
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              LocateLink
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-ocid={`nav.${item.toLowerCase().replace(/ /g, "_")}.link`}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" data-ocid="header.login.button">
              Log In
            </Button>
            <Button size="sm" data-ocid="header.signup.button">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Live Dashboard — shown at top when link is generated */}
        {generatedToken && shareableLink && (
          <LiveDashboard
            token={generatedToken}
            shareableLink={shareableLink}
            copied={copied}
            onCopy={handleCopy}
          />
        )}

        {/* Hero */}
        <section className="bg-accent py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" />
                Real-time location sharing
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-foreground mb-6">
                Share Your
                <br />
                <span className="text-primary">Location</span> With
                <br />
                One Link
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Generate a unique link, share it with anyone. They click, grant
                permission, and their location appears on your map instantly.
              </p>
              <div className="flex flex-wrap gap-4">
                {!generatedToken ? (
                  <Button
                    size="lg"
                    onClick={handleCreateLink}
                    disabled={createRequest.isPending}
                    className="h-12 px-8 text-base font-semibold"
                    data-ocid="hero.create_link.button"
                  >
                    {createRequest.isPending ? (
                      "Creating..."
                    ) : (
                      <>
                        <Link2 className="w-5 h-5 mr-2" />
                        Create Link
                      </>
                    )}
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap gap-2"
                  >
                    <Button
                      size="lg"
                      onClick={() =>
                        navigate({
                          to: "/view/$token",
                          params: { token: generatedToken },
                        })
                      }
                      data-ocid="hero.view_locations.button"
                    >
                      <MapIcon className="w-5 h-5 mr-2" />
                      View Full Map
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setGeneratedToken(null)}
                      data-ocid="hero.create_another.button"
                    >
                      Create Another
                    </Button>
                  </motion.div>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold"
                  data-ocid="hero.learn_more.button"
                >
                  How It Works
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex justify-center"
            >
              <div className="relative w-64 h-[480px]">
                <div className="absolute inset-0 bg-foreground rounded-[2.5rem] shadow-2xl" />
                <div className="absolute inset-[3px] bg-background rounded-[2.4rem] overflow-hidden">
                  <div className="h-10 bg-foreground rounded-t-[2.3rem] flex items-center justify-center">
                    <div className="w-16 h-1.5 bg-background/30 rounded-full" />
                  </div>
                  <div className="bg-accent h-full flex flex-col">
                    <div className="flex-1 relative bg-blue-50 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, #c8d8e8 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #c8d8e8 0px, transparent 1px, transparent 40px)",
                        }}
                      />
                      {PHONE_PINS.map((pos) => (
                        <div
                          key={`${pos.top}-${pos.left}`}
                          className="absolute flex flex-col items-center"
                          style={{ top: pos.top, left: pos.left }}
                        >
                          <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-white" />
                          </div>
                          <div className="w-0.5 h-2 bg-primary" />
                        </div>
                      ))}
                      <div className="absolute top-3 left-2 right-2 bg-background rounded-full px-3 py-1.5 shadow-card flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-foreground">
                          3 locations tracked
                        </span>
                      </div>
                    </div>
                    <div className="bg-background p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground">
                            Ahmad Raza
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            Just now · Lahore
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Features
              </h2>
              <p className="text-muted-foreground">
                Everything you need for seamless location sharing
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-8 shadow-card hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">
                    {f.step}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Demo */}
        <section className="py-20 px-6 bg-accent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Experience real-time map viewing
              </h2>
              <p className="text-muted-foreground">
                Watch locations appear on the map as people share them
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-background rounded-2xl shadow-card border border-border overflow-hidden"
            >
              <div className="h-72 relative bg-blue-50 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, #93c5fd 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #93c5fd 0px, transparent 1px, transparent 60px)",
                  }}
                />
                <div className="absolute top-1/2 left-0 right-0 h-8 bg-white/40 -translate-y-1/2" />
                <div className="absolute left-1/3 top-0 bottom-0 w-8 bg-white/40" />
                {MAP_PINS.map((pin) => (
                  <div
                    key={pin.label}
                    className="absolute flex flex-col items-center"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    <div className="bg-background border-2 border-primary rounded-full px-2 py-0.5 text-[10px] font-bold text-primary shadow-md mb-1 whitespace-nowrap">
                      {pin.label}
                    </div>
                    <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="w-0.5 h-2 bg-primary" />
                  </div>
                ))}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-card">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">
                    Live Tracking Active
                  </span>
                </div>
                <div className="absolute right-4 bottom-4 flex flex-col gap-1">
                  <div className="w-8 h-8 bg-background rounded-lg shadow-card flex items-center justify-center text-foreground font-bold cursor-pointer hover:bg-accent">
                    +
                  </div>
                  <div className="w-8 h-8 bg-background rounded-lg shadow-card flex items-center justify-center text-foreground font-bold cursor-pointer hover:bg-accent">
                    −
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["S", "B", "N"].map((l) => (
                      <div
                        key={l}
                        className="w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    3 people shared their location
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="map_demo.refresh.button"
                >
                  Refresh
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-1">
                  Trusted by Users Globally
                </h2>
                <p className="text-muted-foreground">
                  People love LocateLink for its simplicity
                </p>
              </motion.div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-500 justify-center mb-1">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="font-bold text-foreground text-lg">
                      4.8
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground text-lg mb-1">
                    2M+
                  </div>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground text-lg mb-1">
                    50+
                  </div>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`testimonials.item.${i + 1}`}
                  className="bg-card border border-border rounded-2xl p-6 shadow-card"
                >
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* App Download CTA */}
        <section className="py-16 px-6 bg-accent">
          <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Get the App
              </h2>
              <p className="text-muted-foreground mb-8">
                Available on iOS and Android. Track locations on the go.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  className="h-12 px-6 gap-3"
                  data-ocid="download.appstore.button"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <title>Apple</title>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 gap-3"
                  data-ocid="download.googleplay.button"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <title>Google Play</title>
                    <path d="M3.18 23.76c.3.17.64.24.99.2l12.43-12.43L13.14 8l-9.96 15.76zm17.03-11.09l-2.9-1.67-3.38 3.37 3.38 3.38 2.9-1.67c.82-.48.82-1.94 0-2.41zM3.29.17C3 .34 2.83.66 2.83 1.08v21.84c0 .42.17.74.46.91l.1.06L15.82 12 3.39.11l-.1.06z" />
                  </svg>
                  Google Play
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-footer py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">LocateLink</span>
              </div>
              <p className="text-sm text-white/60 max-w-xs">
                Real-time location sharing made simple. One link, one click, one
                map.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h4 className="font-semibold text-white mb-3">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a
                          href="/"
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
