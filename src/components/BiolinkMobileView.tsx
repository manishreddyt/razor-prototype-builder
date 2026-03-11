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
    profile.viewMode === "shop" ? "shop" : "links"
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
  const bgColor = isProfileType ? "bg-[#E8E3D8]" : "bg-white";

  return (
    <div className={`min-h-screen ${bgColor} flex justify-center items-start`}>
      <div className="w-full max-w-[428px] min-h-screen px-4 py-8 flex flex-col mx-auto">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Profile Image */}
          {profile.profileImage && (
            <div className="mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg">
                <img
                  src={profile.profileImage}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Display Name / Handle */}
          <h1 className="text-lg font-bold text-gray-900 mb-1 text-center">
            {profile.displayName}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 text-center max-w-xs mb-3 whitespace-pre-line">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Row */}
          {activeSocialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-4">
              {activeSocialLinks.map((link) => {
                const Icon = socialIcons[link.platform] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
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
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab("links")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "links"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Links
              </button>
              <button
                onClick={() => setActiveTab("shop")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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
            className="w-full bg-white rounded-2xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 text-left"
            onClick={() => {
              // Could open maps or show more details
            }}
          >
            <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-800 leading-relaxed">
              {profile.location}
            </span>
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
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-snug">
                        {link.title}
                      </h3>
                      {link.subtitle && (
                        <p className="text-xs opacity-90 mt-1">{link.subtitle}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-75" />
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
                className="block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                {/* Product Image with Pink Background */}
                <div className="relative aspect-square bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                  {product.badge && (
                    <span className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-1 rounded-full text-gray-800">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Product Info with Blue Background */}
                <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-3 text-white">
                  <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-base font-bold">
                    ₹{product.pricingModels[0]?.amount || 0}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 text-center">
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Join the {profile.displayName.replace('@', '')} on Linktree
          </a>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">Cookie Preferences</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Report</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Explore</a>
          </div>
        </div>
      </div>
    </div>
  );
};
