import { ChevronRight, Plus, TextAlignStart } from "lucide-react";
import { FamilyData } from "../types/familyTree";

export default function GenerationsPanel({ data, selectedGeneration, onSelectGeneration, onAddGeneration }: {
  data: FamilyData;
  selectedGeneration: number | null;
  onSelectGeneration: (index: number) => void;
  onAddGeneration: () => void;
}) {
  return (
    <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-2 border-b border-gray-200 shadow-md bg-white">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TextAlignStart className="w-5 h-5" />
          Générations
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {data.children_tree.map((generation, index) => {
          const year = data.first_year + index;
          const memberCount = Object.keys(generation).length;
          
          return (
            <button
              key={index}
              onClick={() => onSelectGeneration(index)}
              className={`w-full px-4 py-2 text-left border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                selectedGeneration === index ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    Génération {index + 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    {year} • <span className={`${memberCount === 0 ? 'text-red-600 font-bold' : ''}`}>{memberCount} membre{memberCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          );
        })}
        {/* Bouton déplacé à la fin de la liste scrollable */}
        <div className="p-4">
          <button
            onClick={onAddGeneration}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une génération
          </button>
        </div>
      </div>
    </div>
  );
}
