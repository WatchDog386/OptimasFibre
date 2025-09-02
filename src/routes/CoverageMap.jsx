import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, MapPin, Navigation, Layers, Info, X, ChevronLeft, Search, CheckCircle, AlertCircle, Phone } from 'lucide-react';

const CoveragePage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const kmlLayer = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const pulseIntervalRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  const wifiMarkers = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [kmlVisible, setKmlVisible] = useState(true);
  const [address, setAddress] = useState('');
  const [isEligible, setIsEligible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEligibilityPanel, setShowEligibilityPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Coverage areas with coordinates
  const coveredAreas = [
    { name: "Kasarani", lat: -1.2182, lng: 36.9012 },
    { name: "Githurai", lat: -1.1944, lng: 36.9358 },
    { name: "Ruiru", lat: -1.1489, lng: 36.9631 },
    { name: "Juja", lat: -1.1018, lng: 37.0144 },
    { name: "Thika Town", lat: -1.0332, lng: 37.0693 },
    { name: "Maragwa", lat: -0.7969, lng: 37.1325 },
    { name: "Embakasi West", lat: -1.3071, lng: 36.9142 },
    { name: "Kiambu", lat: -1.1714, lng: 36.8356 },
    { name: "Kiambaa", lat: -1.1833, lng: 36.8167 },
    { name: "Githunguri", lat: -1.0667, lng: 36.8667 },
    { name: "Kikuyu", lat: -1.2465, lng: 36.6669 },
    { name: "Dagoretti North", lat: -1.2833, lng: 36.7167 },
    { name: "Kabete", lat: -1.2667, lng: 36.7333 },
    { name: "Roysambu", lat: -1.2167, lng: 36.8833 },
  ];

  const NAIROBI_BOUNDS = [
    [-1.45, 36.65],
    [-1.15, 37.05],
  ];

  // Filter areas based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAreas(coveredAreas);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAreas(
        coveredAreas.filter(area => 
          area.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, coveredAreas]);

  // Add WiFi markers to the map
  const addWifiMarkers = (map) => {
    const L = window.L;
    
    // Clear existing markers
    wifiMarkers.current.forEach(marker => map.removeLayer(marker));
    wifiMarkers.current = [];

    // Add new markers
    coveredAreas.forEach(area => {
      const wifiIcon = L.divIcon({
        className: 'wifi-marker',
        html: `<div class="wifi-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0066cc" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([area.lat, area.lng], {
        icon: wifiIcon,
        zIndexOffset: 500
      }).addTo(map);

      marker.bindPopup(`<div class="p-2"><b class="text-blue-800">${area.name}</b><br><span class="text-green-600">Coverage available</span></div>`);
      wifiMarkers.current.push(marker);
    });
  };

  const centerOnUserLocation = () => {
    if (!mapInstance.current || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    clearTimeout(locationTimeoutRef.current);
    clearInterval(pulseIntervalRef.current);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        setUserLocation(userCoords);
        setLocationError(null);
        
        mapInstance.current.setView([userCoords.lat, userCoords.lng], 18);
        
        accuracyCircleRef.current = window.L.circle([userCoords.lat, userCoords.lng], {
          radius: userCoords.accuracy,
          color: '#0066cc',
          fillColor: '#0066cc',
          fillOpacity: 0.2,
          weight: 1
        }).addTo(mapInstance.current);

        createPulseEffect([userCoords.lat, userCoords.lng]);

        const displayName = await getAddressFromCoordinates(userCoords.lat, userCoords.lng);
        setAddress(displayName);

        setIsLoading(true);
        setShowEligibilityPanel(true);

        locationTimeoutRef.current = setTimeout(() => {
          checkEligibility(userCoords);
          setIsLocating(false);
        }, 1500);
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const createPulseEffect = (latlng) => {
    const L = window.L;
    clearInterval(pulseIntervalRef.current);
    
    if (markerRef.current) mapInstance.current.removeLayer(markerRef.current);
    if (accuracyCircleRef.current) mapInstance.current.removeLayer(accuracyCircleRef.current);

    markerRef.current = L.marker(latlng, {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      zIndexOffset: 1000
    }).addTo(mapInstance.current);

    const pulseCircle = L.circle(latlng, {
      radius: 10,
      stroke: false,
      fillColor: '#0066cc',
      fillOpacity: 0.7,
      className: 'location-pulse',
    }).addTo(mapInstance.current);

    let radius = 10;
    let opacity = 0.7;
    let growing = true;

    pulseIntervalRef.current = setInterval(() => {
      if (growing) {
        radius += 2;
        opacity -= 0.02;
        if (radius >= 30) growing = false;
      } else {
        radius -= 2;
        opacity += 0.02;
        if (radius <= 10) growing = true;
      }

      pulseCircle.setRadius(radius);
      pulseCircle.setStyle({ fillOpacity: opacity });
    }, 50);
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      let displayName = 'Your current location';
      if (data.address) {
        const addr = data.address;
        displayName = [
          addr.road,
          addr.neighbourhood,
          addr.suburb,
          addr.city_district,
          addr.city
        ].filter(Boolean).join(', ');
      }
      
      return displayName;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Your current location';
    }
  };

  const checkEligibility = (coords) => {
    if (!window.L || !kmlLayer.current) return;
    const point = window.L.latLng(coords.lat, coords.lng);
    let eligible = false;

    kmlLayer.current.eachLayer((layer) => {
      if (layer.getBounds && layer.getBounds().contains(point)) {
        eligible = true;
      }
    });

    setIsEligible(eligible);
    setIsLoading(false);
  };

  const toggleKmlVisibility = () => {
    if (!kmlLayer.current) return;
    if (kmlLayer.current.getMap()) {
      kmlLayer.current.remove();
    } else {
      kmlLayer.current.addTo(mapInstance.current);
    }
    setKmlVisible(!kmlVisible);
  };

  const handleConnectClick = () => {
    navigate('/wifiplans');
    setShowEligibilityPanel(false);
  };

  const toggleMapSize = () => {
    setMapExpanded(!mapExpanded);
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        await import('leaflet');

        const omnivoreScript = document.createElement('script');
        omnivoreScript.src = 'https://unpkg.com/leaflet-omnivore@0.3.4/leaflet-omnivore.min.js';
        omnivoreScript.onload = () => setMapReady(true);
        document.body.appendChild(omnivoreScript);

        const fullscreenCss = document.createElement('link');
        fullscreenCss.rel = 'stylesheet';
        fullscreenCss.href = 'https://unpkg.com/leaflet.fullscreen/Control.FullScreen.css';
        document.head.appendChild(fullscreenCss);

        const fullscreenScript = document.createElement('script');
        fullscreenScript.src = 'https://unpkg.com/leaflet.fullscreen/Control.FullScreen.js';
        document.body.appendChild(fullscreenScript);
      } catch (err) {
        console.error('Error loading map libraries:', err);
      }
    };

    loadLeaflet();

    return () => {
      mapInstance.current?.remove();
      kmlLayer.current?.remove();
      clearTimeout(locationTimeoutRef.current);
      clearInterval(pulseIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !window.L || !window.omnivore || !mapRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      minZoom: 11,
      maxBounds: NAIROBI_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
    }).setView([-1.286389, 36.817223], 12);

    mapInstance.current = map;

    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });

    baseLayer.addTo(map);

    L.control.scale({ position: 'bottomleft' }).addTo(map);

    if (L.control.fullscreen) {
      L.control.fullscreen({ position: 'topright' }).addTo(map);
    }

    L.rectangle(NAIROBI_BOUNDS, {
      color: '#0066cc',
      weight: 3,
      fill: false,
      dashArray: '10 5',
      className: 'leaflet-animated-border',
    }).addTo(map);

    kmlLayer.current = window.omnivore.kml('/coverage.kml')
      .on('ready', () => {
        try {
          map.fitBounds(kmlLayer.current.getBounds(), { padding: [30, 30] });
        } catch (e) {
          console.warn('Could not fit KML bounds:', e);
        }
      })
      .addTo(map);

    // Add WiFi markers
    addWifiMarkers(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({
      position: 'bottomright',
      prefix: '<a href="https://leafletjs.com/">Leaflet</a>',
    }).addTo(map);
  }, [mapReady]);

  // Map Controls Component
  const MapControls = () => (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <button
        onClick={centerOnUserLocation}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Find my location"
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </button>
      
      <button
        onClick={toggleKmlVisibility}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Toggle coverage areas"
      >
        <Layers className="w-5 h-5 text-green-600" />
      </button>
      
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Show legend"
      >
        <Info className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );

  // Coverage Eligibility Panel Component
  const CoverageEligibilityPanel = ({ address, isEligible, isLoading, onClose, onConnect }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white rounded-xl shadow-2xl z-30 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Coverage Check</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Address:</p>
        <p className="font-medium text-gray-900">{address}</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking coverage...</span>
        </div>
      ) : isEligible ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Great news! Your area is covered.</span>
          </div>
          <p className="text-sm text-green-700 mt-2">You can now get high-speed Optimas Fibre internet.</p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Not currently covered</span>
          </div>
          <p className="text-sm text-red-700 mt-2">We're expanding our network. Contact us for future availability.</p>
        </div>
      )}
      
      {isEligible && !isLoading && (
        <button
          onClick={onConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Connect Now
        </button>
      )}
      
      {!isEligible && !isLoading && (
        <a
          href="tel:+254709517917"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Phone className="w-5 h-5 mr-2" />
          Contact Us
        </a>
      )}
    </motion.div>
  );

  return (
    <motion.div
      className="relative min-h-screen w-full bg-gray-50 text-gray-800 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Header Section */}
      <header className="bg-white shadow-sm py-4 px-6 z-20 relative">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-700 hover:text-blue-900 font-medium flex items-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-gray-900">Optimas Fibre Coverage Map</h1>
            <p className="text-sm text-gray-600 mt-1">Check if your area is covered by our high-speed fibre network</p>
          </div>
          <button
            onClick={toggleMapSize}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            {mapExpanded ? 'Show Panel' : 'Expand Map'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Map Section */}
        <div className={`${mapExpanded ? 'w-full' : 'w-full lg:w-2/3'} h-full relative transition-all duration-300`}>
          <main ref={mapRef} className="absolute inset-0 z-10" />
          
          {mapReady && (
            <MapControls />
          )}
        </div>

        {/* Sidebar Section */}
        {!mapExpanded && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="w-full lg:w-1/3 bg-white border-l border-gray-200 overflow-y-auto p-6"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Coverage Areas</h2>
              <p className="text-gray-600 mb-6">
                Optimas Fibre is constantly expanding our network across the region. 
                Check if your area is covered or view our current coverage areas below.
              </p>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search coverage areas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Check Your Address
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Use your current location to check if Optimas Fibre is available in your area.
                </p>
                <button 
                  onClick={centerOnUserLocation}
                  disabled={isLocating}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isLocating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5 mr-2" />
                      Check Eligibility
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                Areas We Cover
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                {filteredAreas.length > 0 ? (
                  filteredAreas.map((area, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{area.name}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No areas found matching your search
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Map Legend
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <Wifi className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Covered Area</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-gray-700">Your Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Coverage Boundary</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Can't find your area? <a href="/contact" className="text-blue-600 hover:underline font-medium">Contact us</a> to inquire about future expansion plans.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Eligibility Panel */}
      <AnimatePresence>
        {showEligibilityPanel && (
          <CoverageEligibilityPanel
            address={address}
            isEligible={isEligible}
            isLoading={isLoading}
            onClose={() => setShowEligibilityPanel(false)}
            onConnect={handleConnectClick}
          />
        )}
      </AnimatePresence>

      {/* Add custom styles for WiFi markers */}
      <style jsx global>{`
        .wifi-marker {
          background: transparent;
          border: none;
        }
        .wifi-icon-container {
          background: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 2px solid #0066cc;
        }
        .wifi-marker svg {
          width: 18px;
          height: 18px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 8px 12px;
          line-height: 1.4;
        }
        .leaflet-control-zoom a {
          background-color: white;
          color: #1e40af;
          border-radius: 4px;
          margin-bottom: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6;
        }
        .leaflet-control-layers {
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-fullscreen a {
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </motion.div>
  );
};

export default CoveragePage;