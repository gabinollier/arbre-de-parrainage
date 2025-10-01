import { useEffect, useMemo, useState } from "react";
import type { Generation, PersonData } from "@/types/familyTree";
import { Plus, Search, TextAlignStart, Trash, UsersRound, X } from "lucide-react";

export default function GenerationMembersPanel({ 
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
  onSelectPerson: (generation: number | null, name: string | null) => void;
  onAddPerson: () => void;
  onDeleteGeneration: (generationIndex: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
  }, [generationIndex]);

  const members = useMemo<[string, PersonData][]>(() => {
    if (!generation) {
      return [];
    }

    return Object.entries(generation) as [string, PersonData][];
  }, [generation]);

  const orderedMembers = useMemo<Array<{ name: string; person: PersonData; matches: boolean }>>(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    const normalized = members.map(([name, person]) => {
      const matches = trimmed.length === 0 || name.toLowerCase().includes(trimmed);
      return { name, person, matches };
    });

    if (trimmed.length === 0) {
      return normalized;
    }

    const matching = normalized.filter((entry) => entry.matches);
    const nonMatching = normalized.filter((entry) => !entry.matches);

    return [...matching, ...nonMatching];
  }, [members, searchQuery]);

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
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-2 border-b border-gray-200 flex items-center justify-between shadow-md bg-white">
        <h3 className="text-lg font-semibold text-gray-800">
          <UsersRound className="w-5 h-5 inline-block mr-1" />
          Génération {generationIndex + 1}
        </h3>
        <div className="flex items-center mr-1">
          {members.length === 0 && (
            <button
              className="px-3 py-1 rounded-xl text-red-600 hover:text-red-800 text-sm"
              title="Cette génération ne contient aucun membre. Vous pouvez la supprimer si vous le souhaitez."
              onClick={() => onDeleteGeneration(generationIndex)}
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onSelectPerson(null, null)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-gray-200 bg-white">
        <label htmlFor="generation-member-search" className="sr-only">
          Rechercher un membre
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="generation-member-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un membre"
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            type="search"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {orderedMembers.map(({ name, person, matches }) => {
          const isSelected = selectedPerson === name;
          const unmatchedClasses = matches
            ? ""
            : "opacity-60 hover:opacity-80 focus-visible:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed";

          return (
            <button
              key={name}
              onClick={() => onSelectPerson(generationIndex, name)}
              className={`w-full px-4 py-2 text-left border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                isSelected ? "bg-blue-100 border-l-4 border-l-blue-500" : ""
              } ${unmatchedClasses}`}
              disabled={!matches}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${matches ? "text-gray-900" : "text-gray-500"}`}>{name}</div>
                  <div className={`text-xs ${matches ? "text-gray-500" : "text-gray-400"}`}>
                    {person.title && <span>{person.title} • </span>}
                    {`${person.children.length} enfant${person.children.length !== 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

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