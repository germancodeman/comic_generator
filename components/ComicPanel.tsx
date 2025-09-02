
import React from 'react';
import type { Panel } from '../types';
import { Loader } from './Loader';

interface ComicPanelProps {
  panel: Panel;
  index: number;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panel, index }) => {
  return (
    <div className="aspect-square bg-slate-800 border-4 border-slate-900 rounded-md shadow-lg flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-slate-900 text-white font-bangers text-2xl w-10 h-10 flex items-center justify-center rounded-br-md z-10">
            {index + 1}
        </div>
        <div className="flex-grow flex items-center justify-center">
            {panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Comic panel ${index + 1}: ${panel.description}`} className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader />
                    <p className="text-sm">Generating...</p>
                </div>
            )}
        </div>
        <div className="p-2 bg-white text-black text-center font-sans text-sm h-16 flex items-center justify-center">
            <p className="italic">"{panel.description}"</p>
        </div>
    </div>
  );
};
