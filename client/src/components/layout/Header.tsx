import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
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

        <div className="md:hidden flex-1 text-center">
          <h1 className="text-lg font-medium text-gray-800">StockManager</h1>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="p-1 mr-4 text-gray-600 hover:text-gray-800">
            <span className="material-icons">notifications</span>
          </Button>
          <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-700">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://ui-avatars.com/api/?name=Admin+User&background=1976d2&color=fff" alt="User avatar" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">Admin User</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
