import { Generation } from "@/types/familyTree";
import { Plus, TextAlignStart, Trash, UsersRound } from "lucide-react";

export default function GenerationPanel({ 
  generation, 
  generationIndex, 
  selectedPerson, 
  onSelectPerson, 
  onAddPerson,
  onDeleteGeneration
}: {
  generation: Generation | null;
  generationIndex: number | null;
  selectedPerson: string | null;
  onSelectPerson: (name: string) => void;
  onAddPerson: () => void;
  onDeleteGeneration: (index: number) => void;
}) {
  if (!generation || generationIndex === null) {
    return (
      <div className="w-1/4 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TextAlignStart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Sélectionnez une génération</p>
        </div>
      </div>
    );
  }

  const members = Object.entries(generation);

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-2 border-b border-gray-200 flex flex-row justify-between items-center shadow-md bg-white">
        <h3 className="text-lg font-semibold text-gray-800">
          <UsersRound className="w-5 h-5 inline-block mr-1" />
          Génération {generationIndex + 1}
        </h3>
        {members.length === 0 && 
        (
          <button className="px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex flex-row items-center gap-1 text-sm"
            title="Cette génération ne contient aucun membre. Vous pouvez la supprimer si vous le souhaitez."
            onClick={() => onDeleteGeneration(generationIndex)}
          >
            <Trash className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {members.map(([name, person]) => (
          <button
            key={name}
            onClick={() => onSelectPerson(name)}
            className={`w-full px-4 py-2 text-left border-b border-gray-200 hover:bg-blue-50 transition-colors ${
              selectedPerson === name ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">
                    {person.title && <span>{person.title} • </span>}
                    {`${person.children.length} enfant${person.children.length !== 1 ? 's' : ''}`}
                  </div>
              </div>
            </div>
          </button>
        ))}

        <div className="p-4 ">
          <button
            onClick={onAddPerson}
            className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une personne
          </button>
        </div>
      </div>
    </div>
  );
}