import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiMapPin, FiClock, FiWifi, FiSearch, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const COVERAGE_DATA = {
  active: [
    { name: "Kasarani", coverage: "Full", rollout: "Available Now" },
    { name: "Githurai", coverage: "Full", rollout: "Available Now" },
    { name: "Ruiru", coverage: "Full", rollout: "Available Now" },
    { name: "Juja", coverage: "Full", rollout: "Available Now" },
    { name: "Thika Town", coverage: "Full", rollout: "Available Now" },
    { name: "Embakasi West", coverage: "Partial", rollout: "Q1 2024" },
    { name: "Kiambu", coverage: "Partial", rollout: "Q1 2024" },
  ],
  planned: [
    { name: "Kiambaa", coverage: "Planned", rollout: "Q2 2024" },
    { name: "Githunguri", coverage: "Planned", rollout: "Q2 2024" },
    { name: "Kikuyu", coverage: "Planned", rollout: "Q3 2024" },
    { name: "Dagoretti North", coverage: "Planned", rollout: "Q3 2024" },
    { name: "Kabete", coverage: "Planned", rollout: "Q4 2024" },
    { name: "Roysambu", coverage: "Planned", rollout: "Q4 2024" },
  ],
};

const fuzzyMatch = (input, options) => {
  const cleanInput = input.toLowerCase().trim();
  return options
    .filter((option) => option.name.toLowerCase().includes(cleanInput))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export default function EligibilityChecker() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue.length > 1) {
      const matches = fuzzyMatch(inputValue, [
        ...COVERAGE_DATA.active,
        ...COVERAGE_DATA.planned,
      ]);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const checkEligibility = async () => {
    if (!inputValue.trim()) {
      setStatus({ type: "error", message: "Please enter a location" });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allAreas = [...COVERAGE_DATA.active, ...COVERAGE_DATA.planned];
    const match = allAreas.find(
      (area) => area.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (match) {
      setSelectedArea(match);
      setStatus({
        type: match.coverage === "Planned" ? "warning" : "success",
        message:
          match.coverage === "Full"
            ? "Full coverage available!"
            : `Coverage ${match.coverage.toLowerCase()} - ${match.rollout}`,
      });
    } else {
      setStatus({
        type: "error",
        message: "Location not in our service network",
      });
    }

    setIsLoading(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (area) => {
    setInputValue(area.name);
    setSelectedArea(area);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-700 hover:text-blue-900 font-medium flex items-center transition-colors mr-4"
          >
            <FiChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Vuma Fibre Coverage Checker</h1>
            <p className="text-sm text-gray-600">Verify your area's network availability</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Check Your Coverage</h2>
              <p className="text-blue-100 text-sm">
                Verify your area's network availability and expansion plans
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your area (e.g., Kasarani)"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && checkEligibility()}
                        onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                        {suggestions.map((area) => (
                          <div
                            key={area.name}
                            onClick={() => handleSuggestionClick(area)}
                            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors
                                     border-b border-gray-100 last:border-0 flex items-center"
                          >
                            <FiMapPin className="text-blue-600 mr-2 flex-shrink-0" />
                            <span className="text-gray-800 font-medium truncate">{area.name}</span>
                            <span className={`text-xs font-medium ml-auto px-2 py-1 rounded-full flex-shrink-0
                              ${area.coverage === "Full" ? "bg-green-100 text-green-800" : 
                                area.coverage === "Partial" ? "bg-yellow-100 text-yellow-800" : 
                                "bg-blue-100 text-blue-800"}`}>
                              {area.coverage}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={checkEligibility}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all
                              ${isLoading
                                ? "bg-blue-600 opacity-75 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                              }
                              flex items-center justify-center gap-2 text-white whitespace-nowrap`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Checking...
                      </>
                    ) : (
                      "Check Coverage"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {status.type && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  status.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : status.type === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {status.type === "success" ? (
                    <FiCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                  ) : status.type === "warning" ? (
                    <FiClock className="text-yellow-600 text-xl flex-shrink-0" />
                  ) : (
                    <FiXCircle className="text-red-600 text-xl flex-shrink-0" />
                  )}
                  <span className="text-gray-800 font-medium">{status.message}</span>
                </div>
              </div>
            )}

            {/* Selected Area Details */}
            {selectedArea && (
              <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FiWifi className="text-blue-600 mr-2" />
                  {selectedArea.name} Coverage Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Coverage Status</p>
                    <p className={`font-semibold ${
                      selectedArea.coverage === "Full" ? "text-green-600" :
                      selectedArea.coverage === "Partial" ? "text-yellow-600" :
                      "text-blue-600"
                    }`}>
                      {selectedArea.coverage}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Availability</p>
                    <p className="font-semibold text-gray-800">{selectedArea.rollout}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Coverage Areas */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Our Coverage Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-green-700 font-semibold mb-3 flex items-center">
                    <FiCheckCircle className="mr-2" />
                    Active Coverage
                  </h4>
                  <ul className="space-y-2">
                    {COVERAGE_DATA.active.map((area) => (
                      <li
                        key={area.name}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-700 text-sm">{area.name}</span>
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {area.coverage}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-blue-700 font-semibold mb-3 flex items-center">
                    <FiClock className="mr-2" />
                    Planned Expansion
                  </h4>
                  <ul className="space-y-2">
                    {COVERAGE_DATA.planned.map((area) => (
                      <li
                        key={area.name}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-700 text-sm">{area.name}</span>
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {area.coverage}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-3">
                Don't see your area? Contact us to request expansion to your neighborhood.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Request Coverage Expansion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}