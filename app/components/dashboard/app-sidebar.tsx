import { IconDashboard, IconSettings, IconPalette } from "@tabler/icons-react";
import { Link } from "react-router";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Projects",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({
  variant,
  user,
}: {
  variant: "sidebar" | "floating" | "inset";
  user: any;
}) {

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/" prefetch="viewport" className="group flex items-center gap-2 px-2 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#D97706] shadow-xs">
                <IconPalette className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] dark:from-[#F59E0B] dark:via-[#FBBF24] dark:to-[#FCD34D] bg-clip-text text-transparent font-serif text-lg font-bold tracking-tight">
                LOOMIS
              </span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#F59E0B]/15 text-[#D97706] dark:text-[#FBBF24] border border-[#F59E0B]/30">
                .ai
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
