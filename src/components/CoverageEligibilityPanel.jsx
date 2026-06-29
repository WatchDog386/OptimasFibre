import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CoverageEligibilityPanel = ({ address, isEligible, isLoading, onClose }) => {
  const navigate = useNavigate();

  const handleGetConnected = () => {
    navigate('/wifiplans');
    onClose(); // Close the panel when navigating
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-full max-w-xs md:max-w-sm"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${isEligible ? 'bg-primary' : 'bg-red-600'}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white tracking-wide">
              {isLoading ? 'Checking Coverage...' : isEligible ? 'Coverage Available' : 'No Coverage'}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close coverage panel"
              className="text-white hover:text-accent p-1 rounded-full transition-colors"
            >
              <CrossIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="flex items-center space-x-3 mb-4">
                <Spinner />
                <p className="text-gray-700">Checking coverage for your location...</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                This may take a few moments as we verify your address.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">ADDRESS CHECKED</p>
                <p className="text-md font-semibold text-gray-800 line-clamp-2">{address}</p>
              </div>

              <div className={`flex items-center space-x-3 mb-6 ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`p-2 rounded-full ${isEligible ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isEligible ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <CrossIcon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {isEligible ? 'This address is in our coverage area' : 'Not currently covered'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isEligible ? 'Fiber internet is available at this location' : 'We may expand to your area soon'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                {isEligible ? (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <p className="text-green-700 font-medium">Great news!</p>
                    <p className="text-green-600 text-sm mt-1">
                      You can now enjoy our high-speed fiber internet service at this location.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700 font-medium">Not covered yet</p>
                    <p className="text-red-600 text-sm mt-1">
                      We're expanding our network and may reach your area soon. Register your interest below.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  className={`w-full px-4 py-3 font-semibold rounded-md transition-colors ${
                    isEligible
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={isEligible ? handleGetConnected : () => alert('Register interest')}
                >
                  {isEligible ? 'Get Connected Now' : 'Register Your Interest'}
                </button>
                {isEligible && (
                  <button
                    className="w-full px-4 py-3 font-medium text-gray-700 hover:text-gray-900 rounded-md transition-colors"
                    onClick={onClose}
                  >
                    Check Another Address
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};