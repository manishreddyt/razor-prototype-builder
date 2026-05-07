import { useState } from "react";
import { Check, Star, ChevronDown, Shield, CreditCard, Sparkles,
  CalendarDays, Clock, MapPin, Users, Play, Image as ImageIcon,
  LayoutGrid, Minus, Phone, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

// Renders a payment page that was published from PaymentPageEditor
const EditorPublicView = ({ pageData }: { pageData: any }) => {
  const [formData, setFormData]   = useState<Record<string, string | number>>({});
  const [processing, setProcessing] = useState(false);

  const primaryColor   = pageData.primaryColor   || "#0066FF";
  const secondaryColor = pageData.secondaryColor || "#EEF3FF";

  const visibleSections = (pageData.sections || []).filter((s: any) => s.visible);

  const amountField = (pageData.formFields || []).find(
    (f: any) => f.fieldKind === "amount"
  );
  const inputFields = (pageData.formFields || []).filter(
    (f: any) => f.fieldKind === "input"
  );

  const totalAmount: number = amountField?.amount || 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = inputFields.filter((f: any) => f.required && !formData[f.id]);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f: any) => f.label).join(", ")}`);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      toast.success(pageData.successMessage || "Payment successful! 🎉");
      setProcessing(false);
    }, 1800);
  };

  const categoryLabel = (cat: string) =>
    ({ education: "Online Course", services: "Professional Service", ecommerce: "Product", events: "Event" }[cat] ?? "Payment");

  const renderSection = (section: any) => {
    const d = section.data || {};

    if (section.type === "hero") return (
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}>
          <Sparkles className="h-3 w-3" />{categoryLabel(pageData.category)}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{d.title}</h1>
        {d.tagline && <p className="text-base font-medium" style={{ color: primaryColor }}>{d.tagline}</p>}
        <p className="text-gray-600 leading-relaxed max-w-xl">{d.description}</p>
      </div>
    );

    if (section.type === "social_proof" || section.type === "stats") return (
      <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
        {(d.items || []).map((item: any, i: number) => (
          <div key={i} className="text-center">
            <div className="text-xl font-bold" style={{ color: primaryColor }}>{item.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    );

    if (section.type === "highlights") return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(d.items || []).map((h: string, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${primaryColor}18` }}>
                <Check className="h-3 w-3" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700">{h}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (section.type === "instructor" || section.type === "about") return (
      <div className="rounded-2xl p-6 flex items-start gap-5" style={{ backgroundColor: secondaryColor }}>
        {d.image && <img src={d.image} alt={d.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow" />}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
            {pageData.category === "education" ? "Your Instructor" : "Your Provider"}
          </p>
          <h3 className="text-base font-semibold text-gray-900">{d.name}</h3>
          <p className="text-xs text-gray-500 mb-0.5">{d.role}</p>
          {d.credentials && <p className="text-xs font-medium mb-1" style={{ color: primaryColor }}>{d.credentials}</p>}
          <p className="text-sm text-gray-600 leading-relaxed">{d.bio}</p>
        </div>
      </div>
    );

    if (section.type === "testimonials") return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">What people say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(d.items || []).slice(0, 4).map((t: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>{t.name?.charAt(0)}</div>
                <span className="text-xs font-medium text-gray-700">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (section.type === "faq") return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
        {(d.items || []).map((faq: any, i: number) => (
          <details key={i} className="border border-gray-200 rounded-xl">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">{faq.q}</span>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-600">{faq.a}</p>
          </details>
        ))}
      </div>
    );

    if (section.type === "description") return (
      <p className="text-gray-600 leading-relaxed">{d.body}</p>
    );

    if (section.type === "schedule") return (
      <div className="space-y-3">
        {d.title && <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>}
        <div className="space-y-2">
          {(d.items || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}>{i + 1}</span>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              </div>
              <span className="text-xs text-gray-400">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (section.type === "event") return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CalendarDays, label: "Date",     value: d.date },
          { icon: Clock,        label: "Time",     value: d.time },
          { icon: MapPin,       label: "Venue",    value: d.venue },
          { icon: Users,        label: "Capacity", value: d.capacity },
        ].filter(e => e.value).map((e, i) => (
          <div key={i} className="rounded-xl p-4 border border-gray-100 space-y-1" style={{ backgroundColor: secondaryColor }}>
            <e.icon className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">{e.label}</p>
            <p className="text-sm font-semibold text-gray-900">{e.value}</p>
          </div>
        ))}
      </div>
    );

    if (section.type === "pricing") return (
      <div className="space-y-3">
        {d.title && <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            {(d.included || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />{item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {(d.notIncluded || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <Minus className="h-4 w-4 flex-shrink-0" />{item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (section.type === "richtext") return (
      <div className="space-y-2">
        {d.heading && <h2 className="text-lg font-semibold text-gray-900">{d.heading}</h2>}
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{d.body}</p>
      </div>
    );

    if (section.type === "video") return (
      <div className="space-y-2">
        {d.title && <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
          {d.url
            ? <iframe src={d.url} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
            : <div className="w-full h-full flex items-center justify-center gap-2 text-gray-400">
                <Play className="h-8 w-8" /><span className="text-sm">No video set</span>
              </div>
          }
        </div>
      </div>
    );

    if (section.type === "image") return (
      <div className="space-y-2">
        {d.url
          ? <img src={d.url} className="w-full rounded-2xl object-cover max-h-96" alt={d.caption || ""} />
          : <div className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400">
              <ImageIcon className="h-6 w-6" />
            </div>
        }
        {d.caption && <p className="text-sm text-gray-500 text-center">{d.caption}</p>}
      </div>
    );

    if (section.type === "gallery") return (
      <div className="space-y-3">
        {d.title && <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>}
        {(d.images || []).length > 0
          ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(d.images || []).map((src: string, i: number) => (
                <img key={i} src={src} className="w-full h-32 object-cover rounded-xl" alt="" />
              ))}
            </div>
          : <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400">
              <LayoutGrid className="h-5 w-5" /><span className="text-sm">No images</span>
            </div>
        }
      </div>
    );

    if (section.type === "cta") return (
      <div className="flex justify-center py-4">
        <button className="px-8 py-3 rounded-xl font-semibold text-sm"
          style={d.style === "outline"
            ? { border: `2px solid ${primaryColor}`, color: primaryColor, backgroundColor: "transparent" }
            : { backgroundColor: primaryColor, color: "white" }}>
          {d.text || "Click here"}
        </button>
      </div>
    );

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          {pageData.logoUrl
            ? <img src={pageData.logoUrl} alt="logo" className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
            : <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ backgroundColor: primaryColor }}>
                {pageData.logoInitial || pageData.merchantName?.[0] || "P"}
              </div>
          }
          <span className="font-bold text-base text-gray-900">{pageData.merchantName}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
        {/* LEFT: content */}
        <div className="space-y-8">
          {visibleSections.map((section: any) => (
            <div key={section.id}>{renderSection(section)}</div>
          ))}

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" />100% Secure</div>
            <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-400" />Razorpay Protected</div>
            <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="ml-0.5">4.9 / 5 rating</span></div>
          </div>

          {/* Contact footer */}
          {(pageData.supportEmail || pageData.supportPhone) && (
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Contact Us</p>
              {pageData.supportEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />{pageData.supportEmail}
                </div>
              )}
              {pageData.supportPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />+91 {pageData.supportPhone}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: payment form */}
        <div className="lg:sticky lg:top-20">
          <form onSubmit={handlePay} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
              <div className="w-8 h-0.5 mt-1.5" style={{ backgroundColor: primaryColor }} />
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Amount display */}
              {amountField && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    {amountField.label}<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {amountField.type === "amount-fixed" ? (
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <span className="pl-3 pr-3 py-2.5 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">₹</span>
                      <span className="px-3 py-2.5 text-sm font-semibold text-gray-900">{amountField.amount?.toLocaleString("en-IN")}</span>
                      <span className="ml-auto mr-3 text-[10px] border rounded px-1.5 py-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>Fixed</span>
                    </div>
                  ) : (
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <span className="pl-3 pr-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 bg-gray-50">₹</span>
                      <input type="number" min="1" required
                        onChange={(e) => setFormData(f => ({ ...f, _amount: e.target.value }))}
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder="Enter amount" />
                    </div>
                  )}
                  {amountField.description && (
                    <p className="text-xs text-gray-400 mt-1">{amountField.description}</p>
                  )}
                </div>
              )}

              {/* Input fields */}
              {inputFields.map((field: any) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea required={field.required} placeholder={field.placeholder}
                      onChange={(e) => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 resize-none" rows={3} />
                  ) : field.type === "dropdown" ? (
                    <select required={field.required}
                      onChange={(e) => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 bg-white">
                      <option value="">{field.placeholder || "Select…"}</option>
                      {(field.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                      required={field.required} placeholder={field.placeholder}
                      onChange={(e) => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1" />
                  )}
                </div>
              ))}

              {/* Payment methods */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"].map((m) => (
                  <span key={m} className="text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-500">{m}</span>
                ))}
              </div>

              {/* CTA */}
              <button type="submit" disabled={processing}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-opacity disabled:opacity-70"
                style={{ backgroundColor: primaryColor }}>
                {processing ? "Processing…" : `${pageData.buttonText || "Pay Now"} — ₹${totalAmount.toLocaleString("en-IN")}`}
              </button>

              <p className="text-center text-xs text-gray-400">
                Powered by <span className="font-semibold" style={{ color: primaryColor }}>Razorpay</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditorPublicView;
