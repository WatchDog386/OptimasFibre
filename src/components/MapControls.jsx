import React from 'react';
import PropTypes from 'prop-types';
import { FiMap, FiEye, FiEyeOff, FiCompass, FiX } from 'react-icons/fi';

const MapControls = ({
  showLegend,
  setShowLegend,
  kmlVisible,
  toggleKmlVisibility,
  centerOnUserLocation,
  userLocation,
  locationError,
  isLocating,
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col space-y-3">
      {/* Main Controls Container */}
      <div className="bg-white rounded-xl shadow-lg p-3 flex flex-col space-y-3">
        {/* Toggle KML Layer */}
        <button
          onClick={toggleKmlVisibility}
          className="flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-700 transition-all duration-200 group"
        >
          <div className={`p-2 rounded-full ${kmlVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
            {kmlVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </div>
          <span className="text-sm font-medium">
            {kmlVisible ? 'Hide Coverage' : 'Show Coverage'}
          </span>
        </button>

        {/* Toggle Legend */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-700 transition-all duration-200 group"
        >
          <div className={`p-2 rounded-full ${showLegend ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
            <FiMap size={18} />
          </div>
          <span className="text-sm font-medium">
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </span>
        </button>

        {/* Locate Me Button */}
        <button
          onClick={centerOnUserLocation}
          disabled={isLocating}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isLocating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
          }`}
        >
          <div className={`p-2 rounded-full ${isLocating ? 'bg-gray-200' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
            <FiCompass 
              size={18} 
              className={isLocating ? 'animate-spin' : ''} 
            />
          </div>
          <span className="text-sm font-medium">
            {isLocating ? 'Locating...' : 'Locate Me'}
          </span>
        </button>
      </div>

      {/* Error Message */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 max-w-xs shadow-lg">
          <div className="bg-red-100 p-2 rounded-full flex-shrink-0 mt-0.5">
            <FiX className="text-red-600" size={16} />
          </div>
          <span className="text-red-700 text-sm">{locationError}</span>
        </div>
      )}

      {/* User Location Display */}
      {userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2 max-w-xs text-sm shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-green-100 p-1 rounded-full">
              <FiCompass className="text-green-600" size={14} />
            </div>
            <span className="text-green-800 font-medium">Your Location</span>
          </div>
          <p className="text-green-700">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

MapControls.propTypes = {
  showLegend: PropTypes.bool.isRequired,
  setShowLegend: PropTypes.func.isRequired,
  kmlVisible: PropTypes.bool.isRequired,
  toggleKmlVisibility: PropTypes.func.isRequired,
  centerOnUserLocation: PropTypes.func.isRequired,
  userLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  locationError: PropTypes.string,
  isLocating: PropTypes.bool.isRequired,
};

export default MapControls;