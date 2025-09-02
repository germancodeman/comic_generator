
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterUploader } from './components/CharacterUploader';
import { ComicStrip } from './components/ComicStrip';
import { PlusIcon, SparklesIcon } from './components/icons';
import { generatePanelImage, splitStoryIntoPanels } from './services/geminiService';
import { LoadingState } from './types';
import type { Character, Panel } from './types';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([
    { id: uuidv4(), name: '', image: null },
  ]);
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleAddCharacter = () => {
    if (characters.length < 5) {
      setCharacters([...characters, { id: uuidv4(), name: '', image: null }]);
    }
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(
      characters.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleGenerateComic = useCallback(async () => {
    setError(null);
    if (!storyPrompt.trim()) {
        setError('Please enter a story prompt.');
        return;
    }
    if (characters.some(c => !c.image || !c.name.trim())) {
        setError('Please provide a name and image for each character.');
        return;
    }

    setLoadingState(LoadingState.GENERATING_STORY);
    setPanels([]);

    try {
        const panelDescriptions = await splitStoryIntoPanels(storyPrompt);
        const initialPanels = panelDescriptions.map(desc => ({
            id: uuidv4(),
            description: desc,
            imageUrl: null
        }));
        setPanels(initialPanels);
        setLoadingState(LoadingState.GENERATING_PANELS);

        for (let i = 0; i < initialPanels.length; i++) {
            const panel = initialPanels[i];
            const imageUrl = await generatePanelImage(panel.description, characters);
            setPanels(prevPanels => 
                prevPanels.map(p => p.id === panel.id ? { ...p, imageUrl } : p)
            );
        }

        setLoadingState(LoadingState.DONE);

    } catch (e) {
        const err = e as Error;
        console.error(err);
        setError(err.message || 'An unknown error occurred.');
        setLoadingState(LoadingState.ERROR);
    }
  }, [storyPrompt, characters]);
  
  const getLoadingMessage = () => {
    switch(loadingState) {
        case LoadingState.GENERATING_STORY:
            return "Breaking down your story into epic panels...";
        case LoadingState.GENERATING_PANELS:
            const generatedCount = panels.filter(p => p.imageUrl).length;
            return `Bringing your comic to life... (Panel ${generatedCount + 1} of ${panels.length})`;
        case LoadingState.DONE:
            return "Your comic is ready! POW!";
        default:
            return "";
    }
  }

  const isGenerating = loadingState === LoadingState.GENERATING_STORY || loadingState === LoadingState.GENERATING_PANELS;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bangers text-cyan-400 drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]">
            Comic Strip AI
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl mx-auto">
            Bring your stories to life! Upload your characters, write a prompt, and watch the magic happen with Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <div>
              <h2 className="text-3xl font-bangers text-amber-400">1. Create Your Cast</h2>
              <div className="flex flex-col gap-4 mt-4">
                {characters.map((char, index) => (
                  <CharacterUploader
                    key={char.id}
                    character={char}
                    onUpdate={handleUpdateCharacter}
                    onRemove={handleRemoveCharacter}
                    characterNumber={index + 1}
                  />
                ))}
                {characters.length < 5 && (
                  <button onClick={handleAddCharacter} className="flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-lg transition-colors text-slate-300 hover:text-white">
                    <PlusIcon className="w-5 h-5" />
                    Add Another Character
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bangers text-amber-400">2. Write Your Story</h2>
              <textarea
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                placeholder="e.g., Captain Astro flies to a mysterious planet and meets a friendly three-eyed alien."
                className="w-full mt-4 p-3 bg-slate-700 border border-slate-600 rounded-md h-32 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                rows={4}
              />
            </div>

            <div>
              <button
                onClick={handleGenerateComic}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg text-xl transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
              >
                <SparklesIcon className="w-6 h-6"/>
                <span className="font-bangers tracking-wider text-2xl">Generate Comic!</span>
              </button>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
          </div>

          {/* Comic Display Section */}
          <div className="flex flex-col">
            {isGenerating && (
                 <div className="mb-4 text-center p-4 bg-slate-800 rounded-lg">
                    <p className="text-amber-400 font-semibold animate-pulse">{getLoadingMessage()}</p>
                 </div>
            )}
            <div className="flex-grow min-h-[500px]">
                <ComicStrip panels={panels} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
