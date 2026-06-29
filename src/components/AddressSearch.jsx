import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AddressSearch = ({ onSelect, theme }) => {
  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length > 2) {
      setIsLoading(true);
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'ke' },
          types: ['address']
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === 'OK') {
            setPredictions(predictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionSelect = (placeId) => {
    placesService.current.getDetails(
      { placeId },
      (place, status) => {
        if (status === 'OK') {
          onSelect(place);
          setSearchValue(place.formatted_address);
          setShowPredictions(false);
        }
      }
    );
  };

  return (
    <div className="absolute top-20 left-4 z-50 w-80 max-w-[90%]" ref={searchRef}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search address..."
            className="w-full px-4 py-3 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          />
          {isLoading && (
            <div className="absolute right-3 top-3.5 animate-spin h-5 w-5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {showPredictions && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <ul>
              {predictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => handlePredictionSelect(prediction.place_id)}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};