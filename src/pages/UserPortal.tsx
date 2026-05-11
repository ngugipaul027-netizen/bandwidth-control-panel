import React, { useState } from 'react';
import { 
  Wifi, 
  Zap, 
  Shield, 
  Clock, 
  Smartphone,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { MOCK_PACKAGES } from '@/lib/mock-data';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserPortal() {
  const [phone, setPhone] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<typeof MOCK_PACKAGES[0] | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState<'landing' | 'profile' | 'packages'>('landing');
  const [isOnline, setIsOnline] = useState(false);

  const handleMpesaPay = () => {
    if (!phone) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }
    setIsPaying(true);
    // Simulate STK Push
    setTimeout(() => {
      setIsPaying(false);
      setSelectedPkg(null);
      toast.success('STK Push sent to your phone. Enter PIN to complete.');
      
      // Simulate payment confirmation
      setTimeout(() => {
        setIsOnline(true);
        toast.success('Payment confirmed! You are now online.', {
          icon: <Wifi className="h-4 w-4 text-green-600" />,
          duration: 5000,
        });
      }, 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Header */}
      <div className="relative h-64 overflow-hidden bg-blue-600 text-white md:h-80">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/8707ddde-0d10-4d4a-83ac-d63f0be79f00/isp-hero-image-1492c0ad-1778507920614.webp" 
          alt="ISP Hero" 
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-4">
          <div className="flex items-center gap-2 text-blue-100 mb-2">
            <Wifi className="h-5 w-5" />
            <span className="font-semibold tracking-wider">SwiftISP Hotspot</span>
          </div>
          <h1 className="text-4xl font-extrabold md:text-6xl">High-Speed Internet</h1>
          <p className="mt-4 text-lg text-blue-100 max-w-xl">
            Experience ultra-fast connectivity starting from as low as KES 20. 
            Instant activation via M-Pesa.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-12 max-w-5xl px-4">
        <AnimatePresence mode="wait">
          {isOnline ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="online-status"
            >
              <Card className="border-green-100 bg-white shadow-xl">
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600">
                    <Wifi className="h-10 w-10 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">You are Online</h2>
                  <p className="mt-2 text-slate-500">Your "Weekly Pro" package is active.</p>
                  
                  <div className="mt-8 grid w-full max-w-md gap-4 grid-cols-2">
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <Clock className="mb-2 h-5 w-5 text-blue-600" />
                      <p className="text-xs text-slate-500">Time Remaining</p>
                      <p className="text-lg font-bold">6d 22h 15m</p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <Zap className="mb-2 h-5 w-5 text-orange-600" />
                      <p className="text-xs text-slate-500">Data Used</p>
                      <p className="text-lg font-bold">1.2 GB</p>
                    </div>
                  </div>

                  <Button variant="outline" className="mt-8" onClick={() => setIsOnline(false)}>
                    View More Packages
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="packages-list"
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-3">
                {MOCK_PACKAGES.map((pkg) => (
                  <Card key={pkg.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-lg">
                    <CardHeader className="bg-slate-50 pb-8">
                      <Badge className="mb-2 w-fit bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {pkg.duration_seconds === 3600 ? 'Hourly' : pkg.duration_seconds === 604800 ? 'Weekly' : 'Monthly'}
                      </Badge>
                      <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6">
                      <div className="mb-6 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">KES {pkg.price}</span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                          <Zap className="h-4 w-4 text-blue-600" />
                          Up to {pkg.download_limit_mbps} Mbps Speed
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Unlimited Browsing
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                          Single Device Only
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="bg-white pt-6">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={() => setSelectedPkg(pkg)}
                      >
                        Buy Now
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Support Card */}
              <Card className="border-none bg-slate-900 text-white">
                <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-slate-800 p-3">
                      <Info className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Need assistance?</h3>
                      <p className="text-slate-400">Our support team is available 24/7 to help you.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-slate-800">
                    Chat with Support
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedPkg} onOpenChange={(open) => !open && setSelectedPkg(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              We'll send an M-Pesa STK Push to your phone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <span className="text-sm font-medium text-slate-600">Package:</span>
              <span className="font-bold text-blue-700">{selectedPkg?.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <span className="text-sm font-medium text-slate-600">Amount:</span>
              <span className="font-bold text-blue-700">KES {selectedPkg?.price}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="0712 345 678" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPaying}
              />
              <p className="text-[10px] text-slate-400">Format: 07XXXXXXXX or 2547XXXXXXXX</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={handleMpesaPay}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>Pay with M-Pesa</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}