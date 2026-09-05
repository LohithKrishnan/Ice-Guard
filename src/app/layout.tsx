import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AICopilot from "@/components/copilot/AICopilot";
import { SimulationProvider } from "@/context/SimulationContext";
import { NavigationProvider } from "@/context/NavigationContext";

export const metadata: Metadata = {
  title: "ICEGUARD AI | Antarctic Sea-Ice & Iceberg Trajectory Decision Support",
  description:
    "AI-powered Antarctic maritime intelligence platform designed to help vessels understand sea-ice conditions, monitor icebergs, predict iceberg movement, assess navigation risk, and select safer routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-polar-950 text-slate-100 antialiased min-h-screen flex overflow-hidden">
        <SimulationProvider>
          <NavigationProvider>
            {/* Command Center Sidebar */}
            <Sidebar />

            {/* Main Operational Viewport */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-gradient-to-b from-polar-950 via-polar-900/60 to-polar-950 p-3 sm:p-5 relative">
                {children}
              </main>
            </div>

            {/* Floating Maritime Copilot */}
            <AICopilot />
          </NavigationProvider>
        </SimulationProvider>
      </body>
    </html>
  );
}
