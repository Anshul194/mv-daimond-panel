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
          const color = metalColorMap[v] || (v?.toLowerCase()?.includes("rose") ? "#f2d1ca" : v?.toLowerCase()?.includes("yellow") ? "#f6e5b8" : v?.toLowerCase()?.includes("white") ? "#e6e6e9" : v?.toLowerCase()?.includes("platinum") ? "#cfcfcf" : "#cfcfcf");
          return (
            <div key={opt._id || v || idx} className="flex flex-col items-center gap-1.5 group">
              <button
                type="button"
                onClick={() => onChange(v)}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 transform group-hover:scale-110 ${selected ? "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2" : "border-gray-200 hover:border-gray-300"}`}
                title={v}
              >
                {imgUrl ? (
                  <img src={imgUrl} alt={v} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <span
                    aria-hidden
                    style={{ background: color }}
                    className="w-12 h-12 rounded-full block shadow-inner border border-white/20"
                  />
                )}
              </button>
              <span className={`text-[10px] font-medium text-center max-w-[60px] leading-tight capitalize transition-colors ${selected ? "text-emerald-600" : "text-gray-500"}`}>
                {v}
              </span>
            </div>
          );
        }

        if (type === "shape") {
          const imgUrl = opt?.image ? getFullImageUrl(opt.image) : null;
          return (
            <button
              key={opt._id || v || idx}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-col items-center justify-center p-2 w-28 h-28 rounded-xl border transition-all duration-300 ${selected ? "bg-emerald-50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30"}`}
              title={v}
            >
              <div className="flex-1 flex items-center justify-center mb-2">
                {imgUrl ? (
                  <img src={imgUrl} alt={v} className="max-w-[48px] max-h-[48px] object-contain transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-lg uppercase shadow-inner">
                    {v.substring(0, 1)}
                  </div>
                )}
              </div>
              <div className={`text-[10px] font-bold text-center uppercase tracking-widest w-full truncate px-1 transition-colors ${selected ? "text-emerald-700" : "text-gray-600"}`}>
                {v}
              </div>
            </button>
          );
        }

        return (
          <button
            key={opt._id || v || idx}
            type="button"
            onClick={() => onChange(v)}
            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${selected ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600"}`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
};

export default AttributeTiles;
