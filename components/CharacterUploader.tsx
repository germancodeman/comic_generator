
import React, { useRef } from 'react';
import type { Character, CharacterImage } from '../types';
import { TrashIcon } from './icons';

interface CharacterUploaderProps {
  character: Character;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onRemove: (id:string) => void;
  characterNumber: number;
}

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

export const CharacterUploader: React.FC<CharacterUploaderProps> = ({ character, onUpdate, onRemove, characterNumber }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const image: CharacterImage = { file, base64, mimeType };
        onUpdate(character.id, { image });
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(character.id, { name: event.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col gap-3 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-cyan-400 font-bangers tracking-wider">Character {characterNumber}</h3>
        {characterNumber > 1 && (
            <button onClick={() => onRemove(character.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                <TrashIcon className="w-5 h-5" />
            </button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div 
          onClick={handleImageClick} 
          className="w-24 h-24 rounded-full bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer overflow-hidden hover:border-cyan-400 transition-colors"
        >
          {character.image ? (
            <img src={URL.createObjectURL(character.image.file)} alt={character.name || 'Character Preview'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 text-xs text-center">Click to Upload</span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`char-name-${character.id}`} className="text-sm font-medium text-slate-300">Name</label>
          <input
            id={`char-name-${character.id}`}
            type="text"
            value={character.name}
            onChange={handleNameChange}
            placeholder={`e.g., Captain Astro`}
            className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-white"
          />
        </div>
      </div>
    </div>
  );
};
