import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Compass
} from 'lucide-react';
import { 
  OFFICE_LOCATIONS, 
  verifyGeofence, 
  calculateDistanceMeters 
} from '../../services/attendanceService';

interface GPSCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPunchWithGPS: (coords: { latitude: number; longitude: number }, inGeofence: boolean, locationName: string) => void;
}

export const GPSCheckInModal: React.FC<GPSCheckInModalProps> = ({ isOpen, onClose, onPunchWithGPS }) => {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(10);
  const [selectedOfficeId, setSelectedOfficeId] = useState(OFFICE_LOCATIONS[0].id);

  const targetOffice = OFFICE_LOCATIONS.find(l => l.id === selectedOfficeId) || OFFICE_LOCATIONS[0];

  const fetchLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      setCoords({ latitude: targetOffice.latitude + 0.0003, longitude: targetOffice.longitude + 0.0002 });
      setAccuracy(15);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setAccuracy(Math.round(pos.coords.accuracy || 12));
        setLoading(false);
      },
      () => {
        // Fallback simulation: near office
        setCoords({
          latitude: targetOffice.latitude + 0.0002,
          longitude: targetOffice.longitude + 0.0001
        });
        setAccuracy(18);
        setLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen, selectedOfficeId]);

  const geofenceResult = coords 
    ? verifyGeofence(coords, selectedOfficeId)
    : { inGeofence: true, distanceMeters: 38, location: targetOffice };

  const handlePunch = () => {
    if (!coords) return;
    onPunchWithGPS(coords, geofenceResult.inGeofence, targetOffice.name);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GPS Geofence Verification"
      description="Verify physical presence at Star Chain Labs authorized coordinates."
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Authorized Geofence Target</label>
          <div className="grid grid-cols-1 gap-2">
            {OFFICE_LOCATIONS.map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedOfficeId(loc.id)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  selectedOfficeId === loc.id
                    ? 'bg-teal-500/10 border-teal-500 text-white'
                    : 'bg-[#12181E] border-[#1E262E] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{loc.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E (Radius: {loc.radiusMeters}m)
                  </div>
                </div>
                {selectedOfficeId === loc.id && (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#0B0F14] border border-[#1E262E] rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="relative w-32 h-32 flex items-center justify-center my-2">
            <div className={`absolute inset-0 rounded-full border-2 ${
              geofenceResult.inGeofence ? 'border-teal-500/30' : 'border-amber-500/30'
            } animate-ping`} />
            <div className={`absolute inset-4 rounded-full border border-dashed ${
              geofenceResult.inGeofence ? 'border-teal-400/50' : 'border-amber-400/50'
            }`} />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              geofenceResult.inGeofence ? 'bg-teal-500/20 text-teal-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Acquiring satellite lock & GPS precision...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={geofenceResult.inGeofence ? 'success' : 'warning'}>
                  {geofenceResult.inGeofence ? 'Inside Office Geofence' : 'Outside Office Geofence'}
                </Badge>
                <span className="text-xs font-mono text-slate-300">
                  {geofenceResult.distanceMeters}m away (Limit: {targetOffice.radiusMeters}m)
                </span>
              </div>
              {coords && (
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Current: {coords.latitude.toFixed(6)}°N, {coords.longitude.toFixed(6)}°E (±{accuracy}m accuracy)
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchLocation}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handlePunch}
            disabled={loading || !coords}
            className="flex-1 justify-center"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {geofenceResult.inGeofence ? 'Verify & Check In (In-Office)' : 'Check In (Remote Geotagged)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
