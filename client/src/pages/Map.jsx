import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NavigationControl, GeolocateControl } from 'mapbox-gl';
import { Users, MapPin, Satellite, Map as MapIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Set your Mapbox token (get from mapbox.com)
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvbGluayIsImEiOiJjbHh4eHh4eHh4eHh4In0.xxxxxxxxx';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(78.9629); // India center
  const [lat, setLat] = useState(20.5937);
  const [zoom, setZoom] = useState(4);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
      bearing: 0
    });

    // Add controls
    map.current.addControl(new NavigationControl(), 'top-right');
    map.current.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add 3D buildings layer when style loads
    map.current.on('style.load', () => {
      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      });
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          fetchNearbyUsers(longitude, latitude);
        },
        (error) => {
          console.error('Location error:', error);
          setLoading(false);
        }
      );
    }

    setLoading(false);

    return () => map.current?.remove();
  }, []);

  const fetchNearbyUsers = async (longitude, latitude) => {
    try {
      // Fetch users within 10km radius
      const response = await fetch(
        `/api/users/nearby?lng=${longitude}&lat=${latitude}&radius=10000`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setNearbyUsers(data.users);
        addUserMarkers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch nearby users');
    }
  };

  const addUserMarkers = (users) => {
    users.forEach(user => {
      if (!user.location?.coordinates) return;

      const el = document.createElement('div');
      el.className = 'user-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden bg-purple-600">
            <img src="${user.avatar || '/default-avatar.png'}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      `;

      el.addEventListener('click', () => setSelectedUser(user));

      new mapboxgl.Marker(el)
        .setLngLat(user.location.coordinates)
        .addTo(map.current);
    });
  };

  const toggleMapStyle = () => {
    const newStyle = mapStyle.includes('dark') 
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/dark-v11';
    setMapStyle(newStyle);
    map.current.setStyle(newStyle);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-500" />
            GeoLink Map
          </h1>
          <div className="flex gap-2">
            <button
              onClick={toggleMapStyle}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
            >
              {mapStyle.includes('satellite') ? <MapIcon className="w-5 h-5" /> : <Satellite className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* Nearby Users Count */}
      <div className="absolute bottom-6 left-6 z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{nearbyUsers.length}</p>
              <p className="text-sm text-gray-300">Nearby Users</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedUser.avatar || '/default-avatar.png'} 
                  alt={selectedUser.fullName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-purple-600"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.fullName?.first} {selectedUser.fullName?.last}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">@{selectedUser.channel?.handle || 'user'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {selectedUser.channel?.isActive && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-sm text-purple-800 dark:text-purple-400 font-medium">
                  Content Creator
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-400">
                  {selectedUser.channel.subscriberCount} subscribers
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                Message
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style>{`
        .user-marker {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .user-marker:hover {
          transform: scale(1.1);
        }
        .mapboxgl-ctrl-group {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          color: white !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Map;
