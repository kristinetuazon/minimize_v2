"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { savePhoto } from "@/lib/photos";
import { actions, useList } from "@/lib/store";

type CameraState = "starting" | "live" | "denied" | "unavailable";

/**
 * A full-screen live camera for adding items by photo. Each snap adds an item
 * (named from the optional text field, or "Item N") with that photo, so you
 * can photograph a whole drawer quickly and rename things later.
 */
export function CameraCapture({ onClose }: { onClose: () => void }) {
  const { list } = useList();
  const video = useRef<HTMLVideoElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("starting");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [canFlip, setCanFlip] = useState(false);
  const [name, setName] = useState("");
  const [snapped, setSnapped] = useState<{ id: string; url: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Start (or restart, when flipping) the camera.
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unavailable");
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
        setState("live");
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch (e) {
        if (cancelled) return;
        const name = (e as DOMException).name;
        setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      }
    }
    void start();
    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
  }, [facing]);

  // Escape closes; free the preview thumbnails on the way out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const thumbs = useRef(snapped);
  useEffect(() => {
    thumbs.current = snapped;
  });
  useEffect(() => () => thumbs.current.forEach((s) => URL.revokeObjectURL(s.url)), []);

  const addPhoto = useCallback(
    async (blob: Blob) => {
      const itemName = name.trim() || `Item ${list.items.length + 1}`;
      const [id] = actions.addItems([itemName], { photo: true });
      if (!id) return;
      try {
        await savePhoto(id, blob);
      } catch {
        actions.setItemPhoto(id, false);
      }
      setSnapped((prev) => [{ id, url: URL.createObjectURL(blob), name: itemName }, ...prev]);
      setName("");
    },
    [name, list.items.length]
  );

  async function snap() {
    const v = video.current;
    if (!v || state !== "live" || busy || !v.videoWidth) return;
    setBusy(true);
    if (!prefersReducedMotion() && flash.current) {
      gsap.fromTo(flash.current, { opacity: 0.9 }, { opacity: 0, duration: 0.4, ease: "power2.out" });
    }
    navigator.vibrate?.(15);
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    if (blob) await addPhoto(blob);
    setBusy(false);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Camera" className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <button type="button" onClick={onClose} className="font-heading text-sm uppercase underline-offset-4 hover:underline">
          Done{snapped.length ? ` (${snapped.length})` : ""}
        </button>
        <span className="font-heading text-sm uppercase opacity-80">Snap your items</span>
        {canFlip ? (
          <button
            type="button"
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            aria-label="Switch camera"
            className="flex size-10 items-center justify-center rounded-full border border-white/50"
          >
            ⟲
          </button>
        ) : (
          <span className="size-10" />
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={video}
          playsInline
          muted
          aria-label="Camera preview"
          className={`size-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
        />
        <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />
        {state !== "live" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="max-w-xs text-lg">
              {state === "starting"
                ? "Starting the camera…"
                : state === "denied"
                  ? "Camera access is blocked. Allow it in your browser's site settings, or pick a photo instead."
                  : "No camera available here (it needs a secure https page). You can pick a photo instead."}
            </p>
            {state !== "starting" ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="border-2 border-white px-4 py-2 font-heading uppercase"
              >
                Choose a photo
              </button>
            ) : null}
          </div>
        ) : null}
        {snapped.length > 0 ? (
          <ul className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] gap-2 overflow-x-auto">
            {snapped.map((s) => (
              <li key={s.id} className="shrink-0 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={s.name} className="size-14 rounded border-2 border-white object-cover" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-center gap-4 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void snap()}
          placeholder={`Name (optional) · Item ${list.items.length + 1}`}
          aria-label="Name for the next photo"
          className="min-w-0 flex-1 rounded-md border border-white/40 bg-white/10 px-3 py-2.5 text-white placeholder:text-white/50"
        />
        <button
          type="button"
          onClick={() => void snap()}
          disabled={state !== "live" || busy}
          aria-label="Take photo"
          className="size-16 shrink-0 rounded-full border-4 border-white bg-white/20 transition active:scale-90 disabled:opacity-40"
        />
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void addPhoto(file);
        }}
      />
    </div>
  );
}
