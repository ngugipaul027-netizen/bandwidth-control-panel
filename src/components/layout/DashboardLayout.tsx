import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  BarChart3, 
  Wifi, 
  Network,
  Settings,
  MessageSquare,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Smartphone,
  MessageCircle,
  Database,
  Globe,
  Settings2,
  Lock,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SubItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path?: string;
  icon: React.ElementType;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { 
    name: 'Customer', 
    icon: Users,
    children: [
      { name: 'Add Customer', path: '/admin/customer/add' },
    ]
  },
  { 
    name: 'Services', 
    icon: Zap,
    children: [
      { name: 'Stats Revenue', path: '/admin/services/stats' },
      { name: 'Customer Usage', path: '/admin/services/usage' },
      { name: 'Internet Plan', path: '/admin/services/plans' },
      { name: 'GenieACS Manager', path: '/admin/services/genieacs' },
    ]
  },
  { 
    name: 'Reports', 
    icon: BarChart3,
    children: [
      { name: 'Mpesa Transactions', path: '/admin/reports/mpesa' },
      { name: 'Payment Transactions', path: '/admin/reports/payments' },
      { name: 'Send Message', path: '/admin/reports/messages' },
    ]
  },
  { 
    name: 'Hotspot', 
    icon: Wifi,
    children: [
      { name: 'Hotspot Voucher', path: '/admin/hotspot/vouchers' },
      { name: 'Hotspot Payment Token', path: '/admin/hotspot/tokens' },
    ]
  },
  { 
    name: 'Network', 
    icon: Network,
    children: [
      { name: 'Radius', path: '/admin/network/radius' },
      { name: 'Settings', path: '/admin/network/settings' },
      { name: 'SMS Gateway', path: '/admin/network/sms' },
      { name: 'Whatsapp Gateway', path: '/admin/network/whatsapp' },
      { name: 'DHCP Server Leases', path: '/admin/network/dhcp' },
      { name: 'Hotspot Settings', path: '/admin/network/hotspot-settings' },
      { name: 'IP Bindings', path: '/admin/network/ip-bindings' },
      { name: 'PPPoE Clients', path: '/admin/network/pppoe' },
    ]
  },
];

function NavLink({ item, isActive, isOpen, onToggle, onMobileClose }: { 
  item: NavItem; 
  isActive: boolean; 
  isOpen?: boolean;
  onToggle?: () => void;
  onMobileClose?: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none",
            isActive 
              ? "bg-blue-50 text-blue-600" 
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <div className="flex items-center">
            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
            {item.name}
          </div>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} 
          />
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                {item.children?.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={onMobileClose}
                    className={cn(
                      "block rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      window.location.pathname === child.path
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.path || '#'}
      onClick={onMobileClose}
      className={cn(
        "flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none",
        isActive 
          ? "bg-blue-50 text-blue-600" 
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
      {item.name}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  React.useEffect(() => {
    // Auto-expand menu if a child is active
    const activeMenu = navItems.find(item => 
      item.children?.some(child => location.pathname === child.path)
    );
    if (activeMenu) {
      setOpenMenus(prev => ({ ...prev, [activeMenu.name]: true }));
    }
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Wifi className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">AvatarPamnet</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isChildActive = item.children?.some(child => location.pathname === child.path);
            const isActive = location.pathname === item.path || isChildActive;
            
            return (
              <NavLink
                key={item.name}
                item={item}
                isActive={!!isActive}
                isOpen={openMenus[item.name]}
                onToggle={() => toggleMenu(item.name)}
                onMobileClose={() => setMobileOpen(false)}
              />
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 border-r md:block">
        <div className="sticky top-0 h-screen">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Wifi className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">AvatarPamnet</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-none">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="h-full min-h-[calc(100vh-4rem)] p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}