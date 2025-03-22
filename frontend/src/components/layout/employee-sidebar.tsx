import { useLocation, Link } from "react-router-dom"
import { Search, ClipboardList, FileText, Sparkles, FileEdit } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"

export function EmployeeSidebar() {
  const location = useLocation()

  const routes = [
    {
      title: "Search Jobs",
      href: "/employee/search-jobs",
      icon: Search,
    },
    {
      title: "My Applications",
      href: "/employee/my-applications",
      icon: ClipboardList,
    },
    {
      title: "My Resume",
      href: "/employee/my-resume",
      icon: FileText,
    },
    {
      title: "Resume Polisher",
      href: "/employee/resume-polisher",
      icon: Sparkles,
    },
    {
      title: "Cover Letter Generator",
      href: "/employee/cover-letter-generator",
      icon: FileEdit,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-2">
        <SidebarTrigger />
        <h1 className="ml-2 text-xl font-bold">Job Portal</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={location.pathname === route.href} tooltip={route.title}>
                <Link to={route.href}>
                  <route.icon className="h-4 w-4" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

