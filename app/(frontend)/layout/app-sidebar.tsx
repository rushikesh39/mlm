"use client";

import { useState } from "react";
import {
  Home,
  ChevronRight,
  Wallet,
  Users,
  ShieldCheck,
  Layers,
  FileBarChart,
  Settings,
} from "lucide-react";

import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar({ role = "admin" }) {
  const { state } = useSidebar(); // icon or expanded
  const [openMenu, setOpenMenu] = useState("");

  // Helper to only keep one dropdown open
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  return (
    <Sidebar collapsible="icon" className="text-[15px]">
      <SidebarContent>
        {/* ---------------- LOGO ---------------- */}
        <div className="flex items-center px-3 py-4">
          {state === "expanded" ? (
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={50}
              className="transition-all"
            />
          ) : (
            <Image
              src="/logo-small.png"
              alt="Logo Small"
              width={40}
              height={40}
              className="transition-all"
            />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* ---------------- Dashboard ---------------- */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-[16px]">
                  <a href="dashboard">
                    <Home className="mr-2 h-10 w-10" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-[16px]">
                  <a href="kyc">
                    <ShieldCheck className="mr-2 h-10 w-10" />
                    <span>KYC</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ---------------- WALLET ---------------- */}
              <Collapsible
                className="group/collapsible"
                open={openMenu === "wallet"}
                onOpenChange={() => toggleMenu("wallet")}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-[15px]">
                      <Wallet className="mr-2 h-6 w-6" />
                      <span>Wallet</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction>
                      <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenuSub className="text-[14px]">
                    <SidebarMenuSubItem>
                      <SidebarMenuButton asChild>
                        <a href="wallet/fund-request">Fund Request</a>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuButton asChild>
                        <a href="wallet/fund-transfer">Fund Transfer</a>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {/* ---------------- ADMIN MENUS ---------------- */}
              {role === "admin" && (
                <>
                  {/* USERS */}

                  <SidebarGroupLabel>Administrator</SidebarGroupLabel>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-[16px]">
                      <a href="kyc-management">
                        <ShieldCheck className="mr-2 h-10 w-10" />
                        <span>KYC Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-[16px]">
                      <a href="user-management">
                        <Users className="mr-2" />
                        <span>Users Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <Collapsible className="group/collapsible">
                    <SidebarMenuItem>
                      <SidebarMenuButton className="text-[15px]">
                        <Wallet className="mr-2 h-6 w-6" />
                         Wallet Management
                      </SidebarMenuButton>

                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction>
                          <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                      <SidebarMenuSub className="text-[14px]">
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <a href="/users/all">Topup Fund Request</a>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <a href="/users/direct-team">Fund Transfer</a>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}

              {/* ---------------- Settings ---------------- */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-[15px]">
                  <a href="/settings">
                    <Settings className="mr-2 h-6 w-6" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
