import { useState } from "react";
import { BiolinkProfile, BiolinkCustomLink } from "@/types/biolink";
import { Product } from "@/types/products";
import { Instagram, Youtube, Mail, MessageCircle, Globe, MapPin, ChevronRight } from "lucide-react";

interface BiolinkMobileViewProps {
  profile: BiolinkProfile;
  products?: Product[];
  onProductClick?: (productId: string) => void;
  onLinkClick?: (linkId: string) => void;
}

const socialIcons: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: MessageCircle,
  twitter: MessageCircle,
  linkedin: MessageCircle,
  whatsapp: MessageCircle,
  telegram: MessageCircle,
  tiktok: MessageCircle,
  custom: Globe,
};

export const BiolinkMobileView = ({
  profile,
  products = [],
  onProductClick,
  onLinkClick,
}: BiolinkMobileViewProps) => {
  const [activeTab, setActiveTab] = useState<"links" | "shop">(
    profile.viewMode === "shop" || profile.viewMode === "both" ? "shop" : "links"
  );

  if (!profile.enabled) {
    return null;
  }

  const activeLinks = (profile.customLinks || [])
    .filter((link) => link.enabled)
    .sort((a, b) => a.order - b.order);

  const activeSocialLinks = profile.socialLinks
    .filter((link) => link.enabled)
    .sort((a, b) => a.order - b.order);

  const showTabs = profile.viewMode === "both";
  const isProfileType = profile.viewMode === "links";

  // Determine background color based on template type
  const bgColor = isProfileType ? "bg-[#B8AFA0]" : "bg-[#F3F4F6]";

  return (
    <div className={`min-h-screen ${bgColor} flex justify-center items-center p-0`}>
      <div className={`w-full max-w-[400px] min-h-screen px-4 py-6 flex flex-col mx-auto ${isProfileType ? "bg-[#E8E3D8]" : "bg-white"}`}>
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Profile Image */}
          <div className="mb-3">
            <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg ${
              profile.profileImage
                ? "bg-gradient-to-br from-blue-900 to-blue-600"
                : "bg-gradient-to-br from-teal-700 to-teal-600"
            }`}>
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Display Name / Handle */}
          <h1 className="text-base font-semibold text-gray-900 mb-2 text-center">
            {profile.displayName}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-gray-600 text-center max-w-[280px] mb-4 whitespace-pre-line leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Row */}
          {activeSocialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3.5 mb-5">
              {activeSocialLinks.map((link) => {
                const Icon = socialIcons[link.platform] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label={link.label || link.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Tabs */}
          {showTabs && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab("links")}
                className={`px-6 py-2 rounded-3xl text-[13px] font-semibold transition-all ${
                  activeTab === "links"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Links
              </button>
              <button
                onClick={() => setActiveTab("shop")}
                className={`px-6 py-2 rounded-3xl text-[13px] font-semibold transition-all ${
                  activeTab === "shop"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Shop
              </button>
            </div>
          )}
        </div>

        {/* Location Card (only for profile type) */}
        {profile.location && isProfileType && (!showTabs || activeTab === "links") && (
          <button
            className="w-full bg-white rounded-2xl p-3.5 mb-3 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 text-left"
            onClick={() => {
              // Could open maps or show more details
            }}
          >
            <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-teal-700 mb-1">Location</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {profile.location}
              </p>
            </div>
          </button>
        )}

        {/* Custom Links / Events (Profile Type) */}
        {(!showTabs || activeTab === "links") && activeLinks.length > 0 && (
          <div className="space-y-3 flex-1">
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onLinkClick) {
                    e.preventDefault();
                    onLinkClick(link.id);
                  }
                }}
                className="block w-full"
              >
                <div className="bg-gradient-to-br from-teal-700 to-teal-500 rounded-2xl p-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[13px] leading-snug">
                        {link.title}
                      </h3>
                      {link.subtitle && (
                        <p className="text-xs opacity-90 mt-1">{link.subtitle}</p>
                      )}
                    </div>
                    <span className="text-lg opacity-70">⋮</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Products Grid (Shop Type) */}
        {(!showTabs || activeTab === "shop") && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 flex-1">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => onProductClick?.(product.id)}
                className="block rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {/* Product Image with Pink Background */}
                <div className="relative aspect-square bg-gradient-to-br from-[#FCD5CE] to-[#FBB6CE] flex items-center justify-center p-5">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                  {product.badge && (
                    <span className="absolute top-2 right-2 bg-white/95 text-[10px] font-semibold px-2.5 py-1 rounded-xl text-gray-700">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Product Info with Blue Background */}
                <div className="bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] p-3 text-white">
                  <h3 className="font-semibold text-xs leading-tight mb-1 line-clamp-2 min-h-[32px]">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold">
                    ₹{product.pricingModels[0]?.amount || product.pricingModels[0]?.price || 0}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6 text-center">
          <a
            href="#"
            className={`inline-flex items-center gap-2 rounded-3xl px-6 py-3 text-[13px] font-medium mb-4 transition-all ${
              isProfileType
                ? "bg-white text-gray-700 shadow-sm hover:shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">R</span>
            </div>
            Powered by Razorpay
          </a>
          <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors">Cookie Preferences</a>
            <span className="text-gray-400">·</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Report</a>
            <span className="text-gray-400">·</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <span className="text-gray-400">·</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Explore</a>
          </div>
        </div>
      </div>
    </div>
  );
};
