import { useEffect, useMemo, useState } from "react";
import type { Generation, PersonData } from "@/types/familyTree";
import { ChevronRight, Plus, Search, TextAlignStart, Trash, UsersRound, X } from "lucide-react";

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
      <div className="w-1/4 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TextAlignStart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Sélectionnez une génération</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-1/4 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r border-gray-200 flex flex-col"
      onClick={(e) => {
        onSelectPerson(generationIndex, null);
      }}>
      <div className="px-4 py-3 min-h-[56px] bg-white/80 backdrop-blur flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <UsersRound className="w-5 h-5" />
          Génération {generationIndex + 1}
        </h3>
        <div className="flex items-center mr-1">
          {members.length === 0 && (
            <button
              className="px-3 py-1 rounded-full text-red-600 hover:text-red-800 text-sm"
              title="Cette génération ne contient aucun membre. Vous pouvez la supprimer si vous le souhaitez."
              onClick={() => onDeleteGeneration(generationIndex)}
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={(e) => {
              onSelectPerson(null, null);
              e.stopPropagation();
            }}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 bg-white/80 backdrop-blur">
        <label htmlFor="generation-member-search" className="sr-only">
          Rechercher un membre
        </label>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="generation-member-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un membre"
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-full bg-white/70 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            type="search"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {orderedMembers.map(({ name, person, matches }) => {
          const isSelected = selectedPerson === name;
          const unmatchedClasses = matches
            ? ""
            : "opacity-50 pointer-events-none";

          return (
            <button
              key={name}
              onClick={(e) => {
                onSelectPerson(generationIndex, name)
                e.stopPropagation();
              }}
              className={`w-full px-4 py-1.5 text-left rounded-xl border transition-all duration-200 shadow-sm flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white/80 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              } ${unmatchedClasses}`}
              disabled={!matches}
            >
              <div className="flex flex-row items-center gap-3 justify-between flex-1">
                <div className={`font-semibold ${isSelected ? "text-white" : matches ? "text-gray-900" : "text-gray-500"}`}>{name}</div>
                <div className={`text-xs ${isSelected ? "text-white/80" : matches ? "text-gray-500" : "text-gray-400"}`}>
                  {person.title && <span>{person.title} • </span>}
                  {person.children.length > 0 && `${person.children.length} enfant${person.children.length !== 1 ? "s" : ""}`}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white/80" : "text-gray-400"}`} />
            </button>
          );
        })}

        <button
          onClick={onAddPerson}
          className="w-full px-4 py-2.5 text-left rounded-xl border border-green-200 text-green-700 bg-white/80 hover:border-green-400 hover:bg-green-50 transition-all duration-200 shadow-sm flex items-center justify-between gap-3"
        >
          <span className="font-semibold">Ajouter une personne</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}