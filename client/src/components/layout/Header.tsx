import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User as UserIcon, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/auth');
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  const userInitials = user?.username ? getInitials(user.username) : 'U';
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="md:flex flex-1 items-center justify-center">
          <h1 className="text-lg font-medium text-gray-800">StockManager</h1>
          <div className="hidden md:flex items-center ml-6 text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span className="text-sm">namarnadh.9@gmail.com</span>
          </div>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-700">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${user?.username}&background=1976d2&color=fff`} 
                    alt={user?.username} 
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{user?.username}</span>
                {isAdmin && <span className="ml-2 text-xs bg-primary/20 text-primary font-semibold rounded-full px-2 py-0.5">Admin</span>}
              </DropdownMenuItem>
              
              {user?.email && (
                <DropdownMenuItem>
                  <span className="ml-6 text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
