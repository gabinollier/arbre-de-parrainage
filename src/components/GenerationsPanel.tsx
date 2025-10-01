import { ChevronRight, Plus, TextAlignStart } from "lucide-react";
import { FamilyData } from "../types/familyTree";

export default function GenerationsPanel({ data, selectedGeneration, onSelectGeneration, onAddGeneration }: {
  data: FamilyData;
  selectedGeneration: number | null;
  onSelectGeneration: (index: number) => void;
  onAddGeneration: () => void;
}) {
  return (
    <div className="w-1/4 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 min-h-[56px] flex items-center bg-white/80 backdrop-blur">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <TextAlignStart className="w-5 h-5" />
          Générations
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {data.children_tree.map((generation, index) => {
          const year = data.first_year + index;
          const memberCount = Object.keys(generation).length;
          
          return (
            <button
              key={index}
              onClick={() => onSelectGeneration(index)}
              className={`w-full px-4 py-2.5 text-left rounded-xl border transition-all duration-200 shadow-sm ${
                selectedGeneration === index
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-600'
                  : 'bg-white/80 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className={`font-semibold ${selectedGeneration === index ? 'text-white' : 'text-gray-900'}`}>
                    Génération {index + 1}
                  </div>
                  <div className={`text-xs ${selectedGeneration === index ? 'text-white/80' : 'text-gray-500'}`}>
                    {year} • <span className={`${memberCount === 0 ? 'text-red-500 font-semibold' : ''}`}>{memberCount} membre{memberCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedGeneration === index ? 'text-white/80' : 'text-gray-400'}`} />
              </div>
            </button>
          );
        })}
        <button
          onClick={onAddGeneration}
          className="w-full px-4 py-2.5 text-left rounded-xl border border-blue-200 text-blue-700 bg-white/80 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center justify-between gap-3"
        >
          <span className="font-semibold">Ajouter une génération</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
