import { useLocation, Link } from "react-router-dom"
import { PlusCircle, Briefcase } from "lucide-react"
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
import { useSidebar } from "../ui/sidebar"  // Assuming you have the Sidebar context

export function EmployerSidebar() {
  const location = useLocation()
  const { state } = useSidebar()  // Get the sidebar state from context

  const routes = [
    {
      title: "Add Jobs",
      href: "/employer/add-jobs",
      icon: PlusCircle,
    },
    {
      title: "My Jobs",
      href: "/employer/my-jobs",
      icon: Briefcase,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-2">
        <SidebarTrigger />
        {/* Conditionally render the Job Portal text */}
        {state === "expanded" && (
          <h1 className="ml-2 text-xl font-bold">Job Portal</h1>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === route.href}
                tooltip={route.title}
              >
                <Link to={route.href}>
                  <route.icon className="h-4 w-4" />
                  {state === "expanded" && <span>{route.title}</span>}
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
