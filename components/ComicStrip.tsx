
import React from 'react';
import type { Panel } from '../types';
import { ComicPanel } from './ComicPanel';

interface ComicStripProps {
  panels: Panel[];
}

export const ComicStrip: React.FC<ComicStripProps> = ({ panels }) => {
  if (panels.length === 0) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700 p-8 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
            <h2 className="mt-4 text-2xl font-bangers text-slate-300">Your Comic Will Appear Here</h2>
            <p className="mt-2 text-center max-w-md">Complete the steps on the left to generate your very own comic strip. Let your imagination run wild!</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg">
      {panels.map((panel, index) => (
        <ComicPanel key={panel.id} panel={panel} index={index} />
      ))}
    </div>
  );
};
