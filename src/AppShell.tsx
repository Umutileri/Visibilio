import type {
  IssueSeverity,
  UIssue,
  ScanResult,
} from "./scanner/types";
import type { ScanApiResponse, ScanRetestResponse, ScanSessionGetResponse, ScanSessionListResponse, ScanSessionStartResponse, WebsiteListResponse } from "./api/types";
import type { WebsiteRef } from "./api/sessionTypes";
import { compareScanSessions } from "./api/scanComparison";
import { buildRetestComparison, type RetestComparison } from "./api/session";
import type { FindingExplanationResponse } from "./api/types";
import { useEffect, useMemo, useRef, useState } from "react";

type AppSection =
  | "overview"
  | "analyze"
  | "findings"
  | "history"
  | "settings";

type RetestUiComparison = {
  session: { id: string; siteName: string };
  findingId: string;
  comparison: RetestComparison;
};

const sections: Array<{ id: AppSection; label: string; key: string }> = [
  { id: "overview", label: "Overview", key: "01" },
  { id: "analyze", label: "Analyze", key: "02" },
  { id: "findings", label: "Findings", key: "03" },
  { id: "history", label: "History", key: "04" },
  { id: "settings", label: "Settings", key: "05" },
];

function sectionFromHash(): AppSection {
  const value = window.location.hash.replace("#app/", "").split("?")[0];
  if (value === "evidence") return "findings";
  return sections.some((section) => section.id === value)
    ? (value as AppSection)
    : "overview";
}

function displayHostname(value: string): string {
  if (!value) return "Choose a website";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function websiteKey(value: string): string {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\\./, "");
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return hostname + ":" + port;
  } catch {
    return "";
  }
}

function flattenResults(
  results: Array<{ viewport: { name: string }; scan: ScanResult }>,
): UIssue[] {
  return results.flatMap(({ scan }) => (scan.ok ? scan.issues : []));
}

function ShellLogo() {
  return (
    <img
      className="saas-shell-logo"
      src="/Visibilio/visibilio-icon.svg"
      alt=""
      aria-hidden="true"
    />
  );
}

function AppShell() {
  const [section, setSection] = useState<AppSection>(sectionFromHash());
  const [focusedFindingId, setFocusedFindingId] = useState<string | null>(() => {
    const hash = window.location.hash;
    const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
    return new URLSearchParams(query).get("finding");
  });
  const [url, setUrl] = useState("");
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanSessionId, setActiveScanSessionId] = useState<string | null>(null);
  const [scanStage, setScanStage] = useState<"idle" | "loading" | "desktop" | "mobile" | "done">("idle");
  const scanAbortRef = useRef<AbortController | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const retestTimerRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ScanApiResponse | null>(null);
  const [history, setHistory] = useState<ScanSessionListResponse | null>(null);
  const [websites, setWebsites] = useState<WebsiteRef[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | IssueSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UIssue["status"]>("all");
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestComparison, setRetestComparison] = useState<RetestUiComparison | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [explanation, setExplanation] = useState<FindingExplanationResponse | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  useEffect(() => {
    const pendingUrl = window.sessionStorage.getItem("visibilio-pending-url");
    if (!pendingUrl) return;
    setUrl(pendingUrl);
    window.sessionStorage.removeItem("visibilio-pending-url");
  }, []);

  useEffect(() => {
    const onHash = () => {
      setSection(sectionFromHash());
      const hash = window.location.hash;
      const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
      setFocusedFindingId(new URLSearchParams(query).get("finding"));
      setMobileNavOpen(false);
      setSiteMenuOpen(false);
      setEvidenceOpen(false);
    };

    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const scanResults = useMemo(() => (response?.ok ? response.results : []), [response]);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint) return;

    let cancelled = false;

    const loadWebsites = async () => {
      setWebsitesLoading(true);
      try {
        const result = await fetch(endpoint.replace(/\/$/, "") + "/api/websites");
        const data = (await result.json()) as WebsiteListResponse;
        if (!cancelled && data.ok) setWebsites(data.websites);
      } catch {
        if (!cancelled) setWebsites([]);
      } finally {
        if (!cancelled) setWebsitesLoading(false);
      }
    };

    void loadWebsites();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint) return;

    let cancelled = false;
