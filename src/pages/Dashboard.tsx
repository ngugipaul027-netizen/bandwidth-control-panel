import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Package as PackageIcon,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { MOCK_SESSIONS, MOCK_PACKAGES } from '@/lib/mock-data';
import { toast } from 'sonner';

const chartData = [
  { name: '08:00', users: 45, bandwidth: 240 },
  { name: '10:00', users: 52, bandwidth: 320 },
  { name: '12:00', users: 85, bandwidth: 560 },
  { name: '14:00', users: 95, bandwidth: 610 },
  { name: '16:00', users: 110, bandwidth: 800 },
  { name: '18:00', users: 130, bandwidth: 950 },
  { name: '20:00', users: 120, bandwidth: 820 },
  { name: '22:00', users: 80, bandwidth: 450 },
];

export default function Dashboard() {
  const handleDisconnect = (username: string) => {
    toast.success(`User ${username} disconnected successfully`);
  };

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Network Overview</h1>
          <p className="text-slate-500">Real-time health and revenue metrics for your ISP.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4 text-slate-500" />
            Refresh
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Active</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">128</div>
            <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% <span className="text-slate-400 ml-1">vs last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expired Today</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">14</div>
            <div className="flex items-center mt-1 text-xs text-red-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +3 <span className="text-slate-400 ml-1">since morning</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">KES 14.5k</div>
            <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.2% <span className="text-slate-400 ml-1">target met</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">142</div>
            <div className="flex items-center mt-1 text-xs text-slate-500">
              <Zap className="h-3 w-3 mr-1 text-orange-400" />
              Avg. 4.2h uptime
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Usage</CardTitle>
            <PackageIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">842 Mb</div>
            <div className="flex items-center mt-1 text-xs text-red-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              84% <span className="text-slate-400 ml-1">capacity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Network load over the last 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{dy: 10}}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bandwidth" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBandwidth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Popular Packages</CardTitle>
            <CardDescription>Subscription breakdown by plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {MOCK_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                      <PackageIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-700">{pkg.name}</span>
                  </div>
                  <span className="text-slate-500 font-medium">{Math.floor(Math.random() * 50) + 10} active</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900">KES {pkg.price}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Monitoring Table Snippet */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Live Monitor</CardTitle>
            <CardDescription>Recently connected users and devices.</CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Filter sessions..." className="pl-9 bg-slate-50 border-none" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SESSIONS.slice(0, 5).map((session) => (
                <TableRow key={session.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{session.profile?.full_name}</span>
                      <span className="text-xs text-slate-400 font-normal">{session.profile?.phone_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white font-normal text-slate-600 border-slate-200">
                      {session.profile?.device_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{session.ip_address}</TableCell>
                  <TableCell className="text-sm text-slate-600 font-medium">{session.uptime}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[10px] uppercase font-bold text-slate-400 gap-0.5">
                      <span className="flex items-center text-blue-600">
                        <ArrowDownRight className="h-2 w-2 mr-1" /> 
                        {(session.bytes_in / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span className="flex items-center text-slate-500">
                        <ArrowUpRight className="h-2 w-2 mr-1" /> 
                        {(session.bytes_out / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium text-green-700">Online</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      onClick={() => handleDisconnect(session.profile?.full_name || 'User')}
                    >
                      Disconnect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}