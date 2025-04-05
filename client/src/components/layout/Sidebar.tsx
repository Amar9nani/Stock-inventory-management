import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Base navigation items for all authenticated users
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Products", href: "/products", icon: "inventory" },
    { name: "Analytics", href: "/analytics", icon: "assessment" },
    { name: "Transactions", href: "/transactions", icon: "history" },
  ];
  
  // Additional admin-only navigation items
  const adminNavigation = [
    { name: "Users", href: "/users", icon: "people" }
  ];
  
  // Combine navigation items based on user role
  const navigation = user?.role === UserRole.ADMIN
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation;

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col text-sidebar-foreground md:static md:flex transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center">
          <span className="material-icons mr-2">store</span>
          <h1 className="text-xl font-medium">StockManager</h1>
        </div>

        <nav className="flex-1">
          <ul>
            {navigation.map((item) => (
              <li key={item.name} className="mb-1">
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 hover:bg-sidebar-accent",
                    isActiveRoute(item.href) && "bg-sidebar-accent"
                  )}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button 
            className="flex items-center text-sm w-full hover:bg-sidebar-accent px-4 py-2 rounded"
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  window.location.href = '/auth';
                }
              });
            }}
          >
            <span className="material-icons mr-3">exit_to_app</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
