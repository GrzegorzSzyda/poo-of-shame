import "./index.css";
import { Logo } from "./layout/Logo";

export const App = () => (
  <div className="flex flex-col min-h-screen items-center justify-center">
    <Logo />
    <p>Twoja kupa, Twój problem.</p>
  </div>
);
