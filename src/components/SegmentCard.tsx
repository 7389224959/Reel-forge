import React, { useState, useEffect } from "react";
import { ReelSegment } from "../types";
import { Download, Image as ImageIcon } from "lucide-react";

interface SegmentCardProps {
  key?: React.Key;
  segment: ReelSegment;
  index: number;
}

export function SegmentCard({ segment, index }: SegmentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<{source: string, keyword?: string} | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function fetchImage() {
      try {
        const keyword = segment.b_roll_keyword.trim() || "cinematic scene";
        
        // Try to search via playwright API (Bing)
        const res = await fetch(`/api/search-image?q=${encodeURIComponent(keyword)}`);
        
        if (res.ok) {
           const data = await res.json();
           if (data.url) {
             if (isMounted) {
               setImageUrl(data.url);
               setImageSource({ source: 'Web Search', keyword });
               return; // Success
             }
           }
        }
      } catch (err) {
        console.error("Image search API error", err);
      }
      
      // Fallback to pollinations if search fails
      const seed = index * 12345 + 42;
      const safeKeyword = encodeURIComponent(segment.b_roll_keyword.trim() || "cinematic scene");
      const fallbackUrl = `https://image.pollinations.ai/prompt/${safeKeyword}?width=800&height=600&nologo=true&seed=${seed}`;
      
      if (isMounted) {
        setImageUrl(fallbackUrl);
        setImageSource({ source: 'AI Generated' });
      }
    }
    
    fetchImage();
    
    return () => {
      isMounted = false;
    };
  }, [segment.b_roll_keyword, index]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const filename = `${segment.b_roll_keyword.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_broll.jpg`;
    window.location.href = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row gap-4 mb-4">
      <div className="sm:w-1/3 flex flex-col border-r border-slate-100 flex-shrink-0">
        <div className="bg-slate-100 relative overflow-hidden group flex-grow min-h-[12rem]">
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={imageUrl} 
                alt={segment.b_roll_visual} 
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              {imageLoading ? (
                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">Image unavailable</span>
                </>
              )}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md z-20">
            Visual: {segment.b_roll_keyword}
          </div>
          
          {imageUrl && !imageError && (
            <button 
              onClick={handleDownload}
              className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
              title="Download visual"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
        {imageSource && (
          <div className="p-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-100">
            Source: {imageSource.source}
            {imageSource.keyword && ` (Keyword: ${imageSource.keyword})`}
          </div>
        )}
      </div>
      
      <div className="p-5 sm:w-2/3 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center bg-blue-100 text-blue-700 w-6 h-6 rounded-full text-xs font-bold">
            {index + 1}
          </span>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Narration</h3>
        </div>
        <p className="text-slate-800 text-lg font-medium leading-relaxed mb-4">
          "{segment.narration}"
        </p>
        <div className="mt-auto">
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Director's Note</h4>
          <p className="text-sm text-slate-600 italic">
            {segment.b_roll_visual}
          </p>
        </div>
      </div>
    </div>
  );
}
