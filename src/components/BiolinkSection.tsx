import { BiolinkProfile } from "@/types/biolink";
import { Product } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Globe,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface BiolinkSectionProps {
  profile: BiolinkProfile;
  products?: Product[];
  onProductClick?: (productId: string) => void;
  onContactClick?: () => void;
}

const socialIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: MessageCircle,
  whatsapp: MessageCircle,
  telegram: Send,
  custom: Globe,
};

export const BiolinkSection = ({
  profile,
  products = [],
  onProductClick,
  onContactClick,
}: BiolinkSectionProps) => {
  const [activeTab, setActiveTab] = useState<"links" | "shop">(
    profile.viewMode === "shop" ? "shop" : "links"
  );

  if (!profile.enabled) {
    return null;
  }

  const activeLinks = profile.socialLinks
    .filter((link) => link.enabled)
    .sort((a, b) => a.order - b.order);

  const activeCustomLinks = (profile.customLinks || [])
    .filter((link) => link.enabled)
    .sort((a, b) => a.order - b.order);

  const publishedProducts = products.filter((p) => p.status === "published");
  const showTabs = profile.viewMode === "both" && publishedProducts.length > 0;

  // Theme configuration
  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    custom: profile.backgroundImage
      ? "bg-cover bg-center"
      : `bg-gradient-to-br ${profile.accentColor || "from-purple-500 to-pink-500"}`,
  };

  const buttonClasses = {
    light: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
    dark: "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700",
    custom: "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm",
  };

  return (
    <section
      className={`min-h-screen py-12 px-4 ${themeClasses[profile.theme]}`}
      style={
        profile.theme === "custom" && profile.backgroundImage
          ? { backgroundImage: `url(${profile.backgroundImage})` }
          : {}
      }
    >
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {profile.profileImage && (
            <div className="mb-4">
              <img
                src={profile.profileImage}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/20 shadow-lg"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold mb-2">{profile.displayName}</h1>

          {profile.bio && (
            <p className="text-sm opacity-90 max-w-md mx-auto mb-2">
              {profile.bio}
            </p>
          )}

          {profile.location && (
            <p className="text-xs opacity-70 flex items-center justify-center gap-1">
              <Globe className="w-3 h-3" />
              {profile.location}
            </p>
          )}
        </div>

        {/* Social Links - Icon Buttons */}
        {activeLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {activeLinks.map((link) => {
              const Icon = socialIcons[link.platform] || Globe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full transition-all hover:scale-110 ${buttonClasses[profile.theme]}`}
                  aria-label={link.label || link.platform}
                  title={link.label || link.platform}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Tabs for Links/Shop */}
        {showTabs && (
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("links")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "links"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Links
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "shop"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Shop
            </button>
          </div>
        )}

        {/* Location Card */}
        {profile.location && (!showTabs || activeTab === "links") && (
          <Card className={`mb-4 p-4 ${buttonClasses[profile.theme]}`}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{profile.location}</span>
            </div>
          </Card>
        )}

        {/* Custom Links - Card Style Buttons */}
        {(!showTabs || activeTab === "links") && activeCustomLinks.length > 0 && (
          <div className="space-y-3 mb-8">
            {activeCustomLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${buttonClasses[profile.theme]}`}
              >
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-transparent border-0">
                  <div className="flex items-center gap-3">
                    {link.icon && (
                      <span className="text-2xl flex-shrink-0">{link.icon}</span>
                    )}
                    {link.image && (
                      <img
                        src={link.image}
                        alt={link.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-0.5 line-clamp-2">
                        {link.title}
                      </h3>
                      {link.subtitle && (
                        <p className="text-xs opacity-75 line-clamp-1">
                          {link.subtitle}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-50" />
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}

        {/* Contact Button */}
        {profile.showContactButton && (
          <div className="mb-8">
            <Button
              onClick={onContactClick}
              className={`w-full py-6 text-lg rounded-full ${buttonClasses[profile.theme]}`}
              variant="outline"
            >
              {profile.contactButtonText || "Get in Touch"}
            </Button>
            {(profile.contactEmail || profile.contactPhone) && (
              <div className="text-center mt-3 text-sm opacity-75">
                {profile.contactEmail && (
                  <a href={`mailto:${profile.contactEmail}`} className="flex items-center justify-center gap-2 mb-1 hover:opacity-100">
                    <Mail className="w-4 h-4" />
                    {profile.contactEmail}
                  </a>
                )}
                {profile.contactPhone && (
                  <a href={`tel:${profile.contactPhone}`} className="flex items-center justify-center gap-2 hover:opacity-100">
                    <Phone className="w-4 h-4" />
                    {profile.contactPhone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {profile.showProductsSection &&
          publishedProducts.length > 0 &&
          (!showTabs || activeTab === "shop") && (
            <div className="mt-8">
              {profile.productsTitle && !showTabs && (
                <h2 className="text-xl font-bold text-center mb-6">
                  {profile.productsTitle}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3">
                {publishedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all overflow-hidden group"
                    onClick={() => onProductClick?.(product.id)}
                  >
                    {product.image && (
                      <div className="relative aspect-square">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        {product.badge && (
                          <span className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-1 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-base font-bold">
                        ₹{product.pricingModels[0]?.amount || product.pricingModels[0]?.price || 0}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        {/* Custom HTML Section */}
        {profile.customHtml && (
          <div
            className="mt-8 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: profile.customHtml }}
          />
        )}
      </div>
    </section>
  );
};
