import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  Scan, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Timer
} from 'lucide-react';
import { generateOfficeQRToken, OFFICE_LOCATIONS } from '../../services/attendanceService';

interface OfficeQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPunchWithQR: (token: string, locationId: string) => void;
}

export const OfficeQRModal: React.FC<OfficeQRModalProps> = ({ isOpen, onClose, onPunchWithQR }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'display'>('scan');
  const [selectedLocation, setSelectedLocation] = useState(OFFICE_LOCATIONS[0].id);
  const [qrData, setQrData] = useState(generateOfficeQRToken(selectedLocation));
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setScanSuccess(false);
      setScanning(false);
      return;
    }

    const interval = setInterval(() => {
      setQrData(generateOfficeQRToken(selectedLocation));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, selectedLocation]);

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        onPunchWithQR(qrData.token, selectedLocation);
        onClose();
      }, 900);
    }, 1200);
  };

  const currentLocation = OFFICE_LOCATIONS.find(l => l.id === selectedLocation) || OFFICE_LOCATIONS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Office QR Check-In"
      description="Scan dynamic reception QR code with location verification."
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2A3441] text-xs font-medium">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${
              activeTab === 'scan'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Scanner View</span>
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${
              activeTab === 'display'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Reception Display Screen</span>
          </button>
        </div>

        {/* Office Location Picker */}
        <div className="flex items-center justify-between p-2.5 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">{currentLocation.name}</div>
              <div className="text-[11px] text-slate-400">{currentLocation.address}</div>
            </div>
          </div>
          <Badge variant="success" size="sm">Site Active</Badge>
        </div>

        {activeTab === 'scan' ? (
          <div className="space-y-4">
            {/* Viewfinder simulator */}
            <div className="relative aspect-video max-w-sm mx-auto bg-black rounded-xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center p-4">
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-teal-400" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-teal-400" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-teal-400" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-teal-400" />

              {scanning && (
                <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-bounce" />
              )}

              {scanSuccess ? (
                <div className="flex flex-col items-center text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-teal-400 animate-pulse" />
                  <div className="text-white font-bold text-sm">QR Code Verified!</div>
                  <div className="text-[11px] text-teal-300">Location: {currentLocation.name}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                    <QrCode className="w-16 h-16 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-300">
                    {scanning ? 'Detecting high-frequency QR token...' : 'Point camera at reception counter QR code'}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={handleSimulateScan}
              disabled={scanning || scanSuccess}
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning QR Code...
                </>
              ) : scanSuccess ? (
                'Verified — Completing Punch In...'
              ) : (
                <>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Office QR & Check In
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-white rounded-2xl inline-block shadow-2xl mx-auto border-4 border-teal-500">
              <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center relative">
                <QrCode className="w-40 h-40 text-teal-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900 border border-teal-400 rounded-md p-1 shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xs mx-auto space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Timer className="w-3.5 h-3.5 text-teal-400" />
                  Token Refreshes in {qrData.secondsRemaining}s
                </span>
                <span className="font-mono text-[10px] text-teal-400 truncate max-w-[120px]">{qrData.token}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(qrData.secondsRemaining / 30) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Place this screen on a tablet at the reception desk or entrance turnstile. 
              Tokens rotate automatically to prevent photo sharing.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
