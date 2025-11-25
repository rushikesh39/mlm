
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(frontend)/layout/app-sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Header />

        <main className="flex-1 p-4">{children}</main>

        <Footer />
      </div>
    </SidebarProvider>
  );
}
