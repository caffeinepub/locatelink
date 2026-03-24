import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LocationEntry } from "../backend";
import { useGetEntries } from "../hooks/useQueries";

declare const L: any;

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString();
}

export default function ViewPage() {
  const { token } = useParams({ from: "/view/$token" });
  const navigate = useNavigate();
  const { data: entries = [], refetch, isFetching } = useGetEntries(token);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/#/share/${token}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
  }, []);

  // Update markers
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
        html: `<div style="background:#2F6FEF;color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(47,111,239,0.4);font-family:'Plus Jakarta Sans',sans-serif;">${entry.labelText || "Unknown"}</div>`,
        iconAnchor: [40, 12],
      });

      L.marker([lat, lng], { icon })
        .bindPopup(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:140px;"><strong style="font-size:13px;">${entry.labelText || "Anonymous"}</strong><br/><span style="font-size:11px;color:#6B7280;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/><span style="font-size:11px;color:#6B7280;">${formatTime(entry.timestamp)}</span></div>`,
        )
        .addTo(markersLayer.current);

      bounds.push([lat, lng]);
    }

    if (bounds.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [entries]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/" })}
              data-ocid="view.back.button"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-foreground">LocateLink</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <code className="flex-1 text-xs bg-accent border border-border rounded-lg px-3 py-1.5 truncate text-muted-foreground">
              {shareLink}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              data-ocid="view.copy_link.button"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            data-ocid="view.refresh.button"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Stats bar */}
        <div className="bg-accent border-b border-border px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {entries.length} location{entries.length !== 1 ? "s" : ""}{" "}
                collected
              </span>
            </div>
            {isFetching && (
              <Badge
                variant="secondary"
                className="text-xs"
                data-ocid="view.loading_state"
              >
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Updating...
              </Badge>
            )}
            {entries.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Map */}
          <div className="flex-1 min-h-[400px] lg:min-h-0 relative">
            <div ref={mapRef} className="absolute inset-0" />
            {entries.length === 0 && !isFetching && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-accent/80 backdrop-blur-sm"
                data-ocid="view.empty_state"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  No locations yet
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Share the link above with people and their locations will
                  appear here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-background flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">
                Location Entries
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <div
                  className="p-6 text-center"
                  data-ocid="view.list.empty_state"
                >
                  <p className="text-sm text-muted-foreground">
                    No entries yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {entries.map((entry: LocationEntry, i: number) => (
                    <motion.li
                      key={`${entry.labelText}-${entry.lat}-${entry.lng}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-accent/50 transition-colors"
                      data-ocid={`view.entry.item.${i + 1}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">
                            {(entry.labelText || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {entry.labelText || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Number(entry.lat).toFixed(4)},{" "}
                            {Number(entry.lng).toFixed(4)}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
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
      </main>
    </div>
  );
}
