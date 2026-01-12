import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { createDeliveryOption } from "../../../store/slices/deliverySlice";
import type { AppDispatch, RootState } from "../../../store/index";
import { useNavigate } from "react-router";

// Font Awesome icon options
const fontAwesomeIcons = [
  { value: "fas fa-truck", label: "Truck", icon: "🚚" },
  { value: "fas fa-motorcycle", label: "Motorcycle", icon: "🏍️" },
  { value: "fas fa-bicycle", label: "Bicycle", icon: "🚲" },
  { value: "fas fa-car", label: "Car", icon: "🚗" },
  { value: "fas fa-plane", label: "Plane", icon: "✈️" },
  { value: "fas fa-ship", label: "Ship", icon: "🚢" },
  { value: "fas fa-walking", label: "Walking", icon: "🚶" },
  { value: "fas fa-clock", label: "Clock", icon: "⏰" },
  { value: "fas fa-bolt", label: "Lightning", icon: "⚡" },
  { value: "fas fa-home", label: "Home", icon: "🏠" },
  { value: "fas fa-box", label: "Box", icon: "📦" },
  { value: "fas fa-shopping-bag", label: "Shopping Bag", icon: "🛍️" },
  { value: "fas fa-gift", label: "Gift", icon: "🎁" },
  { value: "fas fa-heart", label: "Heart", icon: "❤️" },
  { value: "fas fa-star", label: "Star", icon: "⭐" },

  // New additions
  { value: "fas fa-dolly", label: "Hand Truck", icon: "🛒" },
  { value: "fas fa-store", label: "Store", icon: "🏬" },
  { value: "fas fa-warehouse", label: "Warehouse", icon: "🏭" },
  { value: "fas fa-route", label: "Route", icon: "🗺️" },
  { value: "fas fa-shipping-fast", label: "Fast Shipping", icon: "📦💨" },
  { value: "fas fa-map-marker-alt", label: "Location", icon: "📍" },
  { value: "fas fa-credit-card", label: "Payment", icon: "💳" },
  { value: "fas fa-barcode", label: "Barcode", icon: "🔢" },
  { value: "fas fa-tags", label: "Tags", icon: "🏷️" },
  { value: "fas fa-diamond", label: "Diamond", icon: "💎" }, // Diamond
  { value: "fas fa-user-check", label: "Verified User", icon: "✅" },
  { value: "fas fa-cash-register", label: "Checkout", icon: "🧾" },
  { value: "fas fa-cube", label: "Parcel", icon: "📦" },
  { value: "fas fa-boxes", label: "Multiple Packages", icon: "📦📦" },
  { value: "fas fa-truck-loading", label: "Truck Loading", icon: "🚛" },
  { value: "fas fa-truck-moving", label: "Moving Truck", icon: "🚚➡️" },
  { value: "fas fa-concierge-bell", label: "Customer Service", icon: "🛎️" },
  { value: "fas fa-headset", label: "Support", icon: "🎧" },
  { value: "fas fa-globe", label: "Global Shipping", icon: "🌍" },
  { value: "fas fa-shield-alt", label: "Secure Delivery", icon: "🛡️" },
  { value: "fas fa-key", label: "Access", icon: "🔑" },
  { value: "fas fa-truck-monster", label: "Heavy Duty", icon: "🚜" },
  { value: "fas fa-ribbon", label: "Premium Packaging", icon: "🎀" },
  { value: "fas fa-box-open", label: "Open Box", icon: "📦👐" },
  { value: "fas fa-hourglass-half", label: "In Progress", icon: "⏳" },
  { value: "fas fa-truck-pickup", label: "Pickup Truck", icon: "🛻" },
  { value: "fas fa-snowplow", label: "Cold Chain", icon: "❄️🚛" },
  { value: "fas fa-receipt", label: "Invoice", icon: "🧾" },
  { value: "fas fa-clipboard-check", label: "Verified Delivery", icon: "✅📋" },
  { value: "fas fa-bell", label: "Notification", icon: "🔔" },
  { value: "fas fa-envelope-open-text", label: "Shipping Label", icon: "✉️" },
  { value: "fas fa-map", label: "Map", icon: "🗺️" },
  { value: "fas fa-route-highway", label: "Highway", icon: "🛣️" },
  { value: "fas fa-door-open", label: "Doorstep Delivery", icon: "🚪" },
  { value: "fas fa-clipboard-list", label: "Order Checklist", icon: "📋📝" },
  { value: "fas fa-smile", label: "Customer Satisfaction", icon: "😊" },
  { value: "fas fa-medal", label: "Top Rated", icon: "🏅" },
];

export default function AddDeliveryOption() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.delivery);

  const [option, setOption] = useState({
    title: "",
    sub_title: "",
    icon: "", // Changed from File | null to string
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOption({ ...option, [name]: value });
  };

  const handleIconSelect = (iconValue: string) => {
    setOption({ ...option, icon: iconValue });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!option.title) {
      toast.error("Delivery option title is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!option.sub_title) {
      toast.error("Delivery option subtitle is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!option.icon) {
      toast.error("Delivery option icon is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    try {
      await dispatch(
        createDeliveryOption({
          title: option.title,
          sub_title: option.sub_title,
          icon: option.icon, // Now sending the Font Awesome class string
        })
      ).unwrap();
      toast.success("Delivery option created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setOption({ title: "", sub_title: "", icon: "" });
      navigate("/attributes/delivery-options/list");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create delivery option.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  const selectedIcon = fontAwesomeIcons.find(
    (icon) => icon.value === option.icon
  );

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Delivery Option | TailAdmin"
        description="Add a new delivery option page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Delivery Option" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Delivery Option
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Option Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={option.title}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter delivery option title"
                required
              />
            </div>
            {/* Delivery Option Subtitle */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtitle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sub_title"
                value={option.sub_title}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter delivery option subtitle"
                required
              />
            </div>
            {/* Font Awesome Icon Dropdown */}
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between rounded border border-gray-300 px-3 py-2 text-left focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <span className="flex items-center">
                  {selectedIcon ? (
                    <>
                      <span className="mr-2 text-lg">{selectedIcon.icon}</span>
                      <span>{selectedIcon.label}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select an icon</span>
                  )}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
                  {fontAwesomeIcons.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => handleIconSelect(icon.value)}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                    >
                      <span className="mr-3 text-lg">{icon.icon}</span>
                      <div>
                        <div className="font-medium">{icon.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {icon.value}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Delivery Option"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
