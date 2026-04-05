import React from "react";
import { Shield, Zap, Globe, Smartphone, Lock, Cloud } from "lucide-react";

/**
 * SEOSection - Reusable component to display keyword-rich features
 * helps both users and search engine indexers understand the project.
 */
const SEOSection = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" aria-hidden="true" />,
      title: "Fast File Sharing",
      description: "Experience lightning-fast uploads and downloads with no registration required."
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" aria-hidden="true" />,
      title: "Secure & Private",
      description: "Your files are encrypted and shared via a unique secure key for maximum privacy."
    },
    {
      icon: <Cloud className="h-6 w-6 text-blue-500" aria-hidden="true" />,
      title: "Ephemeral Storage",
      description: "Files are automatically deleted after 5 minutes, ensuring your data doesn't linger."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-purple-500" aria-hidden="true" />,
      title: "Mobile Friendly",
      description: "Use our built-in QR code generator to instantly transfer files to your mobile device."
    },
    {
      icon: <Lock className="h-6 w-6 text-red-500" aria-hidden="true" />,
      title: "No-Login Transfer",
      description: "Send large files anonymously. No email or tracking—just pure file sharing."
    },
    {
      icon: <Globe className="h-6 w-6 text-teal-500" aria-hidden="true" />,
      title: "200MB Limit",
      description: "Upload up to 10 files in a single batch with a 200MB aggregate size limit."
    }
  ];

  return (
    <div className="hidden lg:block mt-8 w-full max-w-5xl mx-auto px-4 pb-8 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Why Choose AirBeam?</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
          AirBeam is designed for zero-friction file exchange across devices. 
          Perfect for developers, mobile users, and privacy-conscious sharers.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-100 transition-all duration-300">
            <div className="mb-4 p-3 bg-gray-50 rounded-2xl">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOSection;
