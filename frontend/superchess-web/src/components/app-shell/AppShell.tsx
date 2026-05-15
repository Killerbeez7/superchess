import { AppSidebar } from "@/components/app-shell/AppSidebar";
import { MobileAppHeader } from "@/components/app-shell/MobileAppHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-app text-text-primary lg:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1 overflow-hidden lg:pl-[220px]">
        <MobileAppHeader />
        {children}
      </div>
    </div>
  );
}
