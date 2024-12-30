"use client";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from "components/ui/sidebar";
import { navItems } from "constants/data";
import { useAuth } from "app/contexts/AuthContext";

interface NavItem {
  title: string;
  url: string;
  icon?: string;
  items?: NavItem[];
  isActive?: boolean;
}
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Plus,
  ChevronsUpDown,
  CreditCard,
  GalleryHorizontalEnd,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Icons } from "../icons";
import { DmsLogo } from "components/DmsLogo";
import { User } from "@supabase/supabase-js";

interface Workspace {
  workspace_id: string;
  workspaces: {
    name: string;
    slug: string;
  }[];
}

export const company = {
  name: "DMS",
  logo: DmsLogo
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { supabase, user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] =
    React.useState<Workspace | null>(null);

  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data, error } = await supabase
          .from("workspaces")
          .select("workspace_id, workspaces (name, slug)");

        if (error) throw error;
        setWorkspaces(data);

        // Set current workspace based on URL
        const workspaceSlug = pathname.split("/")[1];
        const current =
          data.find((w: Workspace) =>
            w.workspaces.some((ws) => ws.slug === workspaceSlug)
          ) || null;
        setCurrentWorkspace(current);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    if (user) {
      fetchWorkspaces();
    }
  }, [user, pathname, supabase]);

  const handleWorkspaceChange = (workspace: Workspace) => {
    const newPath = pathname.replace(
      /^\/[^\/]+/,
      `/${workspace.workspaces[0].slug}`
    );
    window.location.href = newPath;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="gap-lg-2 p-lg-2 flex w-full items-center text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <company.logo />
              </div>
              <div className="collapse-hide grid flex-1 text-left text-sm leading-tight">
                <span className="truncate pl-2">
                  <h1 className="text-2xl font-black">{company.name}</h1>
                </span>
              </div>
              <ChevronsUpDown className="collapse-hide size-4 pl-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Pinned Workspaces
            </div>
            <DropdownMenuSeparator />
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.workspace_id}
                onClick={() => handleWorkspaceChange(workspace)}
              >
                {workspace.workspaces[0].name}
                <span className="ml-auto text-xs tracking-widest opacity-60">
                  ⌘{index + 1}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="ml-3 font-medium text-muted-foreground">
                Create Workspace
              </div>
              <span className="ml-auto text-xs tracking-widest opacity-60">
                w
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Tinajero Studios 3D </SidebarGroupLabel>
          <SidebarGroupLabel>
            Workspace ID: acde070d-8c4c-4f0d-9d8a-162843c10333{" "}
          </SidebarGroupLabel>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item: NavItem) => {
              const Icon = item.icon
                ? Icons[item.icon as keyof typeof Icons]
                : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem: NavItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || ''}
                      alt={user?.email || ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.email?.slice(0, 2)?.toUpperCase() || 'CN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.email || ''}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || ''}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url || ''}
                        alt={user?.email || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.email?.slice(0, 2)?.toUpperCase() || 'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.email || ''}
                      </span>
                      <span className="truncate text-xs">
                        {' '}
                        {user?.email || ''}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className="mr-2 size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 size-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter> */}
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
