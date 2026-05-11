"use client";

import { useEffect, useRef, useState } from "react";

type GoogleMapClickEvent = { latLng: { lat: () => number; lng: () => number } };
type GoogleMapsApi = {
  Map: new (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => { addListener: (event: string, cb: (ev: GoogleMapClickEvent) => void) => unknown };
  Marker: new (opts: Record<string, unknown>) => { setPosition: (pos: { lat: number; lng: number }) => void };
  event?: { removeListener?: (listener: unknown) => void };
};

declare global {
  interface Window {
    google?: unknown;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.reject();
  const g = window.google as unknown as { maps?: unknown } | undefined;
  if (g?.maps) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-google-maps="true"]',
  );
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
    });
  }

  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}`;
    s.async = true;
    s.defer = true;
    s.dataset.googleMaps = "true";
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export function GoogleMapPicker(props: {
  apiKey: string;
  lat: number | null;
  lng: number | null;
  onChange: (next: { lat: number; lng: number }) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const { apiKey, lat, lng, onChange } = props;

  useEffect(() => {
    let cancelled = false;
    if (!apiKey) return;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!ready) return;
    if (!ref.current) return;
    const g = window.google as unknown as { maps?: GoogleMapsApi } | undefined;
    const maps = g?.maps;
    if (!maps) return;

    const center = {
      lat: lat ?? -6.2,
      lng: lng ?? 106.8,
    };

    const map = new maps.Map(ref.current, {
      center,
      zoom: lat != null && lng != null ? 14 : 10,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "greedy",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#374151" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#111827" }],
        },
      ],
    });

    const marker =
      lat != null && lng != null
        ? new maps.Marker({ position: center, map })
        : new maps.Marker({ map });

    const clickListener = map.addListener("click", (ev: GoogleMapClickEvent) => {
      const next = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
      marker.setPosition(next);
      onChange(next);
    });

    return () => {
      maps.event?.removeListener?.(clickListener);
    };
  }, [ready, lat, lng, onChange]);

  if (!apiKey) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-accent bg-accent/10 px-3 text-xs text-foreground/70">
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY belum di-set.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="h-[220px] w-full overflow-hidden rounded-xl border border-accent"
    />
  );
}
