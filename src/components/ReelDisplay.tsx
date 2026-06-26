import { ReelData } from "../types";
import { SegmentCard } from "./SegmentCard";
import { CheckCircle2, Clapperboard, FileText } from "lucide-react";

interface ReelDisplayProps {
  data: ReelData;
}

export function ReelDisplay({ data }: ReelDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">
      
      {/* Title Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600 mb-4">
          <Clapperboard className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          {data.title}
        </h1>
        <p className="text-slate-500 font-medium">Ready for production</p>
      </div>

      {/* Facts Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">Verified Facts</h2>
        </div>
        <ul className="space-y-3">
          {data.facts.map((fact, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-relaxed">{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Script Segments */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm">Script</span>
          Shot List
        </h2>
        <div className="space-y-4">
          {data.segments.map((segment, idx) => (
            <SegmentCard key={idx} segment={segment} index={idx} />
          ))}
        </div>
      </div>

    </div>
  );
}
