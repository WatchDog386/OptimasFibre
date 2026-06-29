import React from "react";
import { motion } from "framer-motion";
import { FiWifi, FiDownload, FiUpload } from "react-icons/fi";

const FiberNetworkStats = ({ className }) => {
  // Sample data for demonstration purposes
  const stats = {
    downloadSpeed: "1 Gbps",
    uploadSpeed: "500 Mbps",
    latency: "10 ms",
  };

  return (
    <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        <FiWifi className="mr-2 text-blue-400" />
        Fiber Network Statistics
      </h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4">
          <FiDownload className="text-blue-400 text-4xl mb-2" />
          <h3 className="text-lg font-semibold text-white">Download Speed</h3>
          <p className="text-gray-400 text-xl">{stats.downloadSpeed}</p>
        </div>
        <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4">
          <FiUpload className="text-blue-400 text-4xl mb-2" />
          <h3 className="text-lg font-semibold text-white">Upload Speed</h3>
          <p className="text-gray-400 text-xl">{stats.uploadSpeed}</p>
        </div>
        <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4">
          <FiWifi className="text-blue-400 text-4xl mb-2" />
          <h3 className="text-lg font-semibold text-white">Latency</h3>
          <p className="text-gray-400 text-xl">{stats.latency}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FiberNetworkStats;
