import React from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  forEdit,
}) => {
  const sections = [
    { id: "general", label: "General Info", active: true },
    { id: "price", label: "Price" },
    { id: "properties", label: "Properties" },
    { id: "images", label: "Images" },
    { id: "inventory", label: "Inventory" },
    { id: "attributes", label: "Attributes" },
    // { id: "delivery", label: "Delivery Option" },
    // { id: "settings", label: "Product Settings" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <button className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
          {forEdit ? "Update Product" : "Add New Product"}
        </button>
      </div>
      <nav className="px-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg mb-1 transition-colors ${
              activeSection === section.id
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-3 ${
                  section.id === "general" ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></span>
              {section.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
