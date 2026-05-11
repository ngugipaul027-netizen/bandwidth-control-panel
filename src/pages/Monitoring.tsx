import React from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  Smartphone, 
  Laptop, 
  Tv, 
  Monitor,
  MoreVertical,
  History,
  Filter,
  Download,
  Wifi,
  Activity,
  Cpu,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MOCK_SESSIONS } from '@/lib/mock-data';
import { toast } from 'sonner';

const getDeviceIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes('phone') || normalized.includes('android') || normalized.includes('iphone')) 
    return <Smartphone className="h-4 w-4" />;
  if (normalized.includes('laptop') || normalized.includes('macbook')) 
    return <Laptop className="h-4 w-4" />;
  if (normalized.includes('tv')) 
    return <Tv className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
};

export default function MonitoringPage() {
  const handleAction = (action: string, name: string) => {
    toast.info(`${action} initiated for ${name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Monitoring</h1>
          <p className="text-slate-500">Real-time network traffic and user session control.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700 border border-blue-100">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-semibold">Router Online</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-slate-700 border border-slate-100">
            <History className="h-4 w-4" />
            <span className="text-sm font-semibold">Uptime: 14d 2h</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm md:col-span-3">
          <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between pb-6 border-b">
            <div className="space-y-1">
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Currently connected devices on the MikroTik gateway.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search by phone, MAC, or IP..." className="pl-9 h-9 border-none bg-slate-100" />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Filter className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Download className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6">User Details</TableHead>
                  <TableHead>Hardware</TableHead>
                  <TableHead>Network Info</TableHead>
                  <TableHead>Data Usage</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SESSIONS.map((session) => (
                  <TableRow key={session.id} className="group hover:bg-slate-50/30">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{session.profile?.full_name}</span>
                        <span className="text-xs text-slate-500">{session.profile?.phone_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-slate-100 p-2 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {getDeviceIcon(session.profile?.device_type || 'laptop')}
                        </div>
                        <span className="text-sm font-medium">{session.profile?.device_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="font-mono text-[10px] w-fit border-slate-200 bg-white">{session.mac_address}</Badge>
                        <span className="text-xs font-mono text-slate-400 pl-1">{session.ip_address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>{((session.bytes_in + session.bytes_out) / (1024 * 1024)).toFixed(1)} MB used</span>
                          <span>74%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '74%' }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-700">{session.uptime}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAction('Bandwidth limit', session.profile?.full_name || 'User')}>
                            <Activity className="mr-2 h-4 w-4 text-orange-500" />
                            Limit Bandwidth
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleAction('Disconnect', session.profile?.full_name || 'User')}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Force Disconnect
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Blacklist', session.profile?.full_name || 'User')}>
                            <ShieldAlert className="mr-2 h-4 w-4 text-red-700" />
                            Block MAC Address
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" /> CPU Usage
                  </span>
                  <span className="font-bold text-slate-900">12%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-green-500" style={{ width: '12%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Database className="h-3 w-3" /> Memory (RAM)
                  </span>
                  <span className="font-bold text-slate-900">45%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Clients</span>
                <span className="text-lg font-black text-blue-600">4/250</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-500" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="group relative flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-3 hover:bg-orange-50 transition-colors cursor-default">
                <div className="rounded-full bg-orange-100 p-1">
                  <ShieldAlert className="h-3 w-3 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-orange-900">High Bandwidth</p>
                  <p className="text-[10px] text-orange-700 leading-tight mt-0.5">User Mike Johnson exceeded 10GB/hr.</p>
                  <span className="text-[9px] text-orange-400 mt-1 block">2 mins ago</span>
                </div>
              </div>
              <div className="group relative flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 hover:bg-blue-50 transition-colors cursor-default">
                <div className="rounded-full bg-blue-100 p-1">
                  <Wifi className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-900">New Device</p>
                  <p className="text-[10px] text-blue-700 leading-tight mt-0.5">Smart TV detected on port 2.</p>
                  <span className="text-[9px] text-blue-400 mt-1 block">15 mins ago</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                View all logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}