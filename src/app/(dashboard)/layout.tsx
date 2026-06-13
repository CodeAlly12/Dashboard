import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AIAssistant } from "@/components/layout/ai-assistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
