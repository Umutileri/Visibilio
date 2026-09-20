import LandingPage from "./LandingPage";
import AppShell from "./AppShell";

export default function App() {
  return window.location.hash.startsWith("#app/") ? <AppShell /> : <LandingPage />;
}
