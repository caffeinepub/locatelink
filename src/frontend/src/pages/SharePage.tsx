import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useSubmitLocation } from "../hooks/useQueries";

type State = "idle" | "loading" | "success" | "error" | "denied";

export default function SharePage() {
  const { token } = useParams({ from: "/share/$token" });
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const submitLocation = useSubmitLocation();

  async function handleShare() {
    setState("loading");
    if (!navigator.geolocation) {
      setState("error");
      setErrorMsg("Your browser does not support geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await submitLocation.mutateAsync({
            token,
            name: "Guest",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setState("success");
        } catch {
          setState("error");
          setErrorMsg("Failed to submit your location. Please try again.");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState("denied");
        } else {
          setState("error");
          setErrorMsg("Unable to retrieve your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground">LocateLink</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
            data-ocid="share.success_state"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Location Shared!
            </h1>
            <p className="text-muted-foreground">
              Your location has been shared successfully. You can now close this
              page.
            </p>
          </motion.div>
        ) : state === "denied" ? (
          <motion.div
            key="denied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
            data-ocid="share.error_state"
          >
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Permission Denied
            </h1>
            <p className="text-muted-foreground mb-6">
              You've declined location access. Please allow location permissions
              in your browser settings and try again.
            </p>
            <Button
              onClick={() => setState("idle")}
              variant="outline"
              data-ocid="share.retry.button"
            >
              Try Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="bg-background rounded-2xl border border-border shadow-card p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Navigation className="w-10 h-10 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Share Your Location
                </h1>
                <p className="text-muted-foreground text-sm">
                  Tap the button below and allow location access when prompted.
                </p>
              </div>

              {state === "error" && (
                <div
                  className="w-full bg-destructive/10 rounded-xl p-4 text-sm text-destructive flex items-center gap-2"
                  data-ocid="share.error_state"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <Button
                className="w-full h-14 text-base font-semibold rounded-xl"
                onClick={handleShare}
                disabled={state === "loading"}
                data-ocid="share.submit.button"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Turn On Location
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Powered by{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                caffeine.ai
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
