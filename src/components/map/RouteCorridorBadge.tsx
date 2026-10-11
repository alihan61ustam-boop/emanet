import React from 'react';
import { getCityByName } from '../../lib/turkishCities';

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
    <div className="flex flex-wrap items-center gap-1.5 py-1 font-mono text-xs">
      {cities.map((city, idx) => {
        const isOrigin = highlightOrigin && city.toLowerCase() === highlightOrigin.toLowerCase();
        const isDest = highlightDest && city.toLowerCase() === highlightDest.toLowerCase();
        const isFirst = idx === 0;
        const isLast = idx === cities.length - 1;

        const cityObj = getCityByName(city);
        const plateStr = cityObj ? String(cityObj.plate).padStart(2, '0') : '--';

        let badgeStyle = 'bg-[#151720] text-[#9EA4B8] border-[#252836]';
        let prefixTag = plateStr;

        if (isOrigin || isFirst) {
          badgeStyle = 'bg-[#FF4500] text-black border-[#FF4500] font-black shadow-md shadow-[#FF4500]/20';
          prefixTag = 'ORİJİN·' + plateStr;
        } else if (isDest || isLast) {
          badgeStyle = 'bg-[#CCFF00] text-black border-[#CCFF00] font-black shadow-md shadow-[#CCFF00]/20';
          prefixTag = 'VARIŞ·' + plateStr;
        }

        return (
          <React.Fragment key={city}>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border transition-all ${badgeStyle}`}
            >
              <span className="opacity-75 text-[10px] tracking-tighter">[{prefixTag}]</span>
              <span className="tracking-wide uppercase font-bold">{city}</span>
            </span>

            {idx < cities.length - 1 && (
              <span className="text-[#4E5467] text-[11px] select-none">⇢</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
