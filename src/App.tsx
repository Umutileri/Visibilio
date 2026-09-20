import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import AppShell from "./AppShell";

function useAppRoute() {
  const [isApp, setIsApp] = useState(() =>
    window.location.hash.startsWith("#app/"),
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsApp(window.location.hash.startsWith("#app/"));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return isApp;
}

export default function App() {
  return useAppRoute() ? <AppShell /> : <LandingPage />;
}
