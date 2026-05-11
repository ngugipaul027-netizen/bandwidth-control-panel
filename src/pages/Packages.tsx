import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { MOCK_PACKAGES } from '@/lib/mock-data';

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Package Management</h1>
          <p className="text-slate-500">Configure your internet plans and pricing.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Package
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Price (KES)</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Bandwidth (D/U)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PACKAGES.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium text-slate-900">{pkg.name}</TableCell>
                  <TableCell>{pkg.price}</TableCell>
                  <TableCell>
                    {pkg.duration_seconds === 3600 ? '1 Hour' : 
                     pkg.duration_seconds === 604800 ? '7 Days' : '30 Days'}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-blue-600">{pkg.download_limit_mbps}M</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="text-xs font-medium text-orange-600">{pkg.upload_limit_mbps}M</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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