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
import { MOCK_PAYMENTS } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Logs</h1>
        <p className="text-slate-500">Track all M-Pesa transactions and confirmations.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>User Phone</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAYMENTS.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">
                    {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{payment.phone}</TableCell>
                  <TableCell>{payment.package?.name}</TableCell>
                  <TableCell>KES {payment.amount}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.mpesa_receipt_number || '-'}</TableCell>
                  <TableCell>
                    <Badge className={
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {payment.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {/* Empty state simulation if needed */}
              {MOCK_PAYMENTS.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No payment logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}