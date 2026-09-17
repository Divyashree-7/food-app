import React, { useEffect, useState } from 'react';
import { Navigation, Store as StoreIcon, Home, Bike, Compass, Sparkles } from 'lucide-react';

interface LiveMapProps {
  storeName: string;
  customerAddress: string;
  driverLat?: number;
  driverLng?: number;
  orderStatus: string;
  onSimulateStep?: () => void;
  language: 'en' | 'hi';
}

export const LiveMap: React.FC<LiveMapProps> = ({
  storeName,
  customerAddress,
  driverLat = 17.3330,
  driverLng = 76.8385,
  orderStatus,
  onSimulateStep,
  language,
}) => {
  // Gulbarga Map Coordinate Bounds for SVG rendering
  // Lat: ~17.324 to 17.342
  // Lng: ~76.820 to 76.852
  const minLat = 17.320;
  const maxLat = 17.345;
  const minLng = 76.818;
  const maxLng = 76.855;

  const width = 600;
  const height = 340;

  // Convert lat/lng to SVG x,y coordinates
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    // Invert lat for SVG y (higher lat is north, smaller y)
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return { x: Math.max(30, Math.min(width - 30, x)), y: Math.max(30, Math.min(height - 30, y)) };
  };

  // Fixed Gulbarga Store coordinates (Sedam Road)
  const storeCoords = toSvgCoords(17.3340, 76.8402);
  // Fixed Gulbarga Customer coordinates (Anand Nagar)
  const customerCoords = toSvgCoords(17.3275, 76.8465);
  // Dynamic Driver coordinates
  const driverCoords = toSvgCoords(driverLat, driverLng);

  const [pingPulse, setPingPulse] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setPingPulse((p) => !p);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700/80 shadow-md">
          <Compass className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-semibold text-neutral-200">
            {language === 'hi' ? 'गुलबर्गा इंट्रा-सिटी लाइव नेविगेशन' : 'Gulbarga Intra-City Live GPS'}
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {onSimulateStep && orderStatus === 'out_for_delivery' && (
            <button
              onClick={onSimulateStep}
              className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'राइडर स्टेप आगे बढ़ाएं' : 'Advance Rider GPS'}</span>
            </button>
          )}
          <div className="bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-700 text-xs text-neutral-300 font-medium">
            3.2 km • 11 {language === 'hi' ? 'मिनट' : 'mins'}
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[280px] sm:h-[320px] bg-[#0c121e] select-none"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
          </pattern>
        </defs>

        {/* Map Grid Pattern */}
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Simulated Gulbarga Major Road Network */}
        {/* Sedam Road Arterial Highway */}
        <path
          d="M 60 180 Q 220 150, 380 170 T 560 210"
          stroke="#334155"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 60 180 Q 220 150, 380 170 T 560 210"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
        />

        {/* Station Road / Ring Road Cross */}
        <path
          d="M 280 40 Q 320 160, 340 310"
          stroke="#334155"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 280 40 Q 320 160, 340 310"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Super Market & MSK Mill Inner Roads */}
        <path d="M 120 70 L 300 160 L 480 120" stroke="#1e293b" strokeWidth="5" fill="none" />
        <path d="M 180 290 L 350 180 L 520 280" stroke="#1e293b" strokeWidth="5" fill="none" />

        {/* Landmarks Watermarks */}
        <text x="140" y="110" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="0.5">
          CENTRAL BUS STAND
        </text>
        <text x="360" y="80" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="0.5">
          SEDAM ROAD
        </text>
        <text x="100" y="240" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="0.5">
          SUPER MARKET
        </text>
        <text x="410" y="280" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="0.5">
          ANAND NAGAR / SHARANA CAMPUS
        </text>

        {/* Active Route Polyline from Store to Customer */}
        <path
          d={`M ${storeCoords.x} ${storeCoords.y} Q ${(storeCoords.x + customerCoords.x) / 2 - 30} ${(storeCoords.y + customerCoords.y) / 2 + 20}, ${customerCoords.x} ${customerCoords.y}`}
          stroke="#f43f5e"
          strokeWidth="4"
          strokeDasharray="6 4"
          fill="none"
          filter="url(#glow)"
        />

        {/* STORE PIN */}
        <g transform={`translate(${storeCoords.x}, ${storeCoords.y})`}>
          <circle r="16" fill="#f43f5e" fillOpacity="0.25" className="animate-ping" />
          <circle r="11" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
          <circle r="4" fill="#ffffff" />
          <text
            y="-18"
            textAnchor="middle"
            fill="#fecdd3"
            fontSize="10"
            fontWeight="bold"
            className="drop-shadow-md"
          >
            {storeName.split(' ')[0]}
          </text>
        </g>

        {/* CUSTOMER DESTINATION PIN */}
        <g transform={`translate(${customerCoords.x}, ${customerCoords.y})`}>
          <circle r="14" fill="#10b981" fillOpacity="0.3" />
          <circle r="10" fill="#059669" stroke="#ffffff" strokeWidth="2" />
          <circle r="3.5" fill="#ffffff" />
          <text
            y="24"
            textAnchor="middle"
            fill="#a7f3d0"
            fontSize="10"
            fontWeight="bold"
            className="drop-shadow-md"
          >
            {language === 'hi' ? 'आपका पता' : 'Your Address'}
          </text>
        </g>

        {/* LIVE MOVING DRIVER BIKE PIN */}
        <g
          transform={`translate(${driverCoords.x}, ${driverCoords.y})`}
          className="transition-all duration-700 ease-out"
        >
          {/* Pulsing ring */}
          <circle r={pingPulse ? '24' : '18'} fill="#f59e0b" fillOpacity="0.25" />
          <circle r="14" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" filter="url(#glow)" />
          {/* Bike icon representation */}
          <path
            d="M -5 -3 L 2 -3 L 5 3 L -3 3 Z"
            fill="#ffffff"
          />
          <circle cx="-3" cy="3" r="2.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
          <circle cx="5" cy="3" r="2.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
          <text
            y="-18"
            textAnchor="middle"
            fill="#fde68a"
            fontSize="10"
            fontWeight="bold"
            className="drop-shadow"
          >
            {language === 'hi' ? 'विजय (राइडर)' : 'Vijay (Rider)'}
          </text>
        </g>
      </svg>

      {/* Footer Status Bar */}
      <div className="bg-neutral-900/95 border-t border-neutral-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-neutral-300 font-medium">
            {orderStatus === 'out_for_delivery'
              ? language === 'hi'
                ? 'राइडर सेडम रोड से आनंद नगर की ओर गतिमान है'
                : 'Rider moving along Sedam Road towards Anand Nagar'
              : orderStatus === 'picked_up'
              ? language === 'hi'
                ? 'आर्डर पिकअप हो चुका है, डिलीवरी शुरू'
                : 'Order picked up from store, dispatching'
              : language === 'hi'
              ? 'राइडर स्टोर पर प्रतीक्षारत है'
              : 'Rider reaching store'}
          </span>
        </div>

        <div className="text-neutral-400 font-mono text-[11px]">
          GPS: {driverLat.toFixed(4)}°N, {driverLng.toFixed(4)}°E
        </div>
      </div>
    </div>
  );
};
