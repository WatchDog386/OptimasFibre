import React from 'react';
import { motion } from 'framer-motion';
import { X, Wifi, Clock, MapPin, AlertCircle } from 'lucide-react';

export const MapLegend = ({ onClose }) => {
  const legendItems = [
    {
      icon: <Wifi className="w-4 h-4 text-green-600" />,
      label: 'Coverage Available',
      description: 'Areas with active fiber network'
    },
    {
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      label: 'Coming Soon',
      description: 'Planned expansion areas'
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
      label: 'No Coverage',
      description: 'Areas not currently served'
    },
    {
      icon: <MapPin className="w-4 h-4 text-red-500" />,
      label: 'Your Location',
      description: 'Your current position'
    }
  ];

  return (
    <motion.div
      className="absolute bottom-4 left-4 z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">Map Legend</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.label}</p>
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};