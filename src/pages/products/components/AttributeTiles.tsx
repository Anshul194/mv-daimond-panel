import React from "react";

interface Term {
  _id?: string;
  value?: string;
  name?: string;
}

interface Props {
  options: any[];
  value: string;
  onChange: (v: string) => void;
  type?: string; // 'metal' | 'shape' | undefined
}

const metalColorMap: Record<string, string> = {
  "18k White Gold": "#e6e6e9",
  "18k Rose Gold": "#f2d1ca",
  "18k Yellow Gold": "#f6e5b8",
  Platinum: "#cfcfcf",
};

const getOptionValue = (opt: any) => {
  if (!opt) return "";
  return opt.value || opt.name || (typeof opt === "string" ? opt : "");
};

const baseImageUrl = (import.meta && import.meta.env && import.meta.env.VITE_IMAGE_URL) || '';

const getFullImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const cleanBase = baseImageUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;
};

const AttributeTiles: React.FC<Props> = ({ options = [], value, onChange, type }) => {
  const opts = Array.isArray(options) ? options : [];

  return (
    <div className="flex flex-wrap gap-3">
      {opts.map((opt, idx) => {
        const v = getOptionValue(opt);
        const selected = String(value) === String(v);

        if (type === "metal") {
          const imgUrl = opt?.image ? getFullImageUrl(opt.image) : null;
          const color = metalColorMap[v] || (v?.toLowerCase()?.includes("rose") ? "#f2d1ca" : v?.toLowerCase()?.includes("yellow") ? "#f6e5b8" : "#cfcfcf");
          return (
            <button
              key={opt._id || v || idx}
              type="button"
              onClick={() => onChange(v)}
              className={`flex items-center justify-center w-12 h-12 rounded-full border ${selected ? "ring-2 ring-emerald-500" : "border-gray-200"}`}
              title={v}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={v} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span
                  aria-hidden
                  style={{ background: color }}
                  className="w-8 h-8 rounded-full block"
                />
              )}
            </button>
          );
        }

        if (type === "shape") {
          const imgUrl = opt?.image ? getFullImageUrl(opt.image) : null;
          return (
            <button
              key={opt._id || v || idx}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-col items-center justify-center p-2 w-20 h-20 rounded-lg border text-xs ${selected ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}
              title={v}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={v} className="w-10 h-10 mb-1 object-contain" />
              ) : (
                <div className="w-full text-center truncate">{v}</div>
              )}
              <div className="text-[11px] text-center truncate w-full">{v}</div>
            </button>
          );
        }

        return (
          <button
            key={opt._id || v || idx}
            type="button"
            onClick={() => onChange(v)}
            className={`px-3 py-2 rounded-md border text-sm ${selected ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
};

export default AttributeTiles;
