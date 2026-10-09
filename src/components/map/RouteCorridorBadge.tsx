import React from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface RouteCorridorBadgeProps {
  cities: string[];
  highlightOrigin?: string;
  highlightDest?: string;
}

export const RouteCorridorBadge: React.FC<RouteCorridorBadgeProps> = ({
  cities,
  highlightOrigin,
  highlightDest
}) => {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {cities.map((city, idx) => {
        const isOrigin = highlightOrigin && city.toLowerCase() === highlightOrigin.toLowerCase();
        const isDest = highlightDest && city.toLowerCase() === highlightDest.toLowerCase();
        const isFirst = idx === 0;
        const isLast = idx === cities.length - 1;

        let badgeStyle = 'bg-slate-800/80 text-slate-300 border-white/5';
        if (isOrigin || isFirst) {
          badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-semibold';
        } else if (isDest || isLast) {
          badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-500/40 font-semibold';
        }

        return (
          <React.Fragment key={city}>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border shadow-sm transition-all ${badgeStyle}`}
            >
              {isOrigin || isFirst ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              ) : isDest || isLast ? (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              ) : (
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
              )}
              <span>{city}</span>
            </span>

            {idx < cities.length - 1 && (
              <span className="text-slate-600 text-xs font-mono select-none">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
