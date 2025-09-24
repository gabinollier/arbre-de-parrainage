import { FamilyData } from "@/types/familyTree";
import { Edit3, UserRound, X } from "lucide-react";
import TagInput from "./TagInput";

export default function PersonPanel({ 
  data,
  generationIndex,
  personName,
  onDataChange,
  onSelectPerson
}: {
  data: FamilyData;
  generationIndex: number | null;
  personName: string | null;
  onDataChange: (newData: FamilyData) => void;
  onSelectPerson: (generationIndex: number | null, personName: string | null) => void;
}) {


  if (!data || generationIndex === null || !personName) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Edit3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Sélectionnez une personne à éditer</p>
        </div>
      </div>
    );
  }

  const person = data.children_tree[generationIndex]?.[personName];
  if (!person) return null;

  // Helper functions
  const updatePersonName = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    const newData = { ...data };
    
    // Update in current generation
    const generation = { ...newData.children_tree[generationIndex] };
    const personData = generation[oldName];
    delete generation[oldName];
    generation[newName] = personData;
    newData.children_tree[generationIndex] = generation;
    
    // Update in all parents' children arrays
    for (let i = 0; i < newData.children_tree.length; i++) {
      const gen = { ...newData.children_tree[i] };
      let changed = false;
      
      for (const [parentName, parentData] of Object.entries(gen)) {
        const childrenIndex = parentData.children.indexOf(oldName);
        if (childrenIndex !== -1) {
          gen[parentName] = {
            ...parentData,
            children: parentData.children.map(child => child === oldName ? newName : child)
          };
          changed = true;
        }
      }
      
      if (changed) {
        newData.children_tree[i] = gen;
      }
    }
    
    onDataChange(newData);
  };

  const updatePersonTitle = (title: string) => {
    const newData = { ...data };
    const generation = { ...newData.children_tree[generationIndex] };
    generation[personName] = {
      ...person,
      title: title || undefined
    };
    newData.children_tree[generationIndex] = generation;
    onDataChange(newData);
  };

  const removeChild = (childName: string) => {
    const newData = { ...data };
    const generation = { ...newData.children_tree[generationIndex] };
    generation[personName] = {
      ...person,
      children: person.children.filter(child => child !== childName)
    };
    newData.children_tree[generationIndex] = generation;
    onDataChange(newData);
  };

  const addChild = (childName: string) => {
    if (person.children.includes(childName)) return;
    
    const newData = { ...data };
    const generation = { ...newData.children_tree[generationIndex] };
    generation[personName] = {
      ...person,
      children: [...person.children, childName]
    };
    newData.children_tree[generationIndex] = generation;
    onDataChange(newData);
  };



  // Get available children (next generation)
  const nextGeneration = data.children_tree[generationIndex + 1] || {};
  const availableChildren = Object.keys(nextGeneration).filter(name => 
    !person.children.includes(name)
  );

  // Get available parents (previous generation)
  const prevGeneration = generationIndex > 0 ? data.children_tree[generationIndex - 1] || {} : {};
  const currentParents = Object.entries(prevGeneration)
    .filter(([_, parentData]) => parentData.children.includes(personName))
    .map(([name]) => name);
  
  const availableParents = Object.keys(prevGeneration).filter(name => 
    !currentParents.includes(name)
  );

  const removeParent = (parentName: string) => {
    const newData = { ...data };
    const prevGen = { ...newData.children_tree[generationIndex - 1] };
    prevGen[parentName] = {
      ...prevGen[parentName],
      children: prevGen[parentName].children.filter(child => child !== personName)
    };
    newData.children_tree[generationIndex - 1] = prevGen;
    onDataChange(newData);
  };

  const addParent = (parentName: string) => {
    const newData = { ...data };
    const prevGen = { ...newData.children_tree[generationIndex - 1] };
    prevGen[parentName] = {
      ...prevGen[parentName],
      children: [...prevGen[parentName].children, personName]
    };
    newData.children_tree[generationIndex - 1] = prevGen;
    onDataChange(newData);
  };



  return (
    <div className="flex-1 bg-white">

      <div className="border-b border-gray-200 py-2 px-2 flex items-center justify-between mb-4 shadow-md bg-white">
        <h3 className="text-lg font-semibold text-gray-800">
          <UserRound className="w-5 h-5 inline-block mr-1" />
          Édition de {personName}
        </h3>
        <button
          onClick={() => onSelectPerson(generationIndex, null)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="px-4 h-full">
        {/* Name and Title Fields - Same Line */}
        <div className="mb-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => updatePersonName(personName, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle (optionnel)
            </label>
            <input
              type="text"
              value={person.title || ""}
              onChange={(e) => updatePersonTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Resp, Trésorier, ..."
            />
          </div>
        </div>

        {/* Parents Field (not for first generation) */}
        {generationIndex > 0 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parents
            </label>
            <TagInput
              tags={currentParents}
              availableOptions={availableParents}
              onAddTag={(name) => {
                const newData = { ...data };
                const prevGeneration = { ...newData.children_tree[generationIndex - 1] };
                // Si la personne existe déjà, on conserve ses données
                const existingParent = prevGeneration[name];
                prevGeneration[name] = {
                  ...(existingParent || { children: [] }),
                  children: [...((existingParent && existingParent.children) || []), personName]
                };
                newData.children_tree[generationIndex - 1] = prevGeneration;
                onDataChange(newData);
              }}
              onRemoveTag={removeParent}
              onSelectTag={(parentName) => onSelectPerson(generationIndex - 1, parentName)}
              placeholder="Ajouter un parent..."
              createLabel="Créer"
            />
          </div>
        )}

        {/* Children Field */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enfants
          </label>
          <TagInput
            tags={person.children}
            availableOptions={availableChildren}
            onAddTag={(name) => {
              const newData = { ...data };
              // Ensure next generation exists
              const nextGenIndex = generationIndex + 1;
              while (newData.children_tree.length <= nextGenIndex) {
                newData.children_tree.push({});
              }
              // Ajout ou conservation des données existantes
              const nextGeneration = { ...newData.children_tree[nextGenIndex] };
              const existingChild = nextGeneration[name];
              nextGeneration[name] = existingChild || { children: [] };
              newData.children_tree[nextGenIndex] = nextGeneration;
              // Ajout dans la liste des enfants
              const currentGeneration = { ...newData.children_tree[generationIndex] };
              currentGeneration[personName] = {
                ...person,
                children: [...person.children, name]
              };
              newData.children_tree[generationIndex] = currentGeneration;
              onDataChange(newData);
            }}
            onRemoveTag={removeChild}
            onSelectTag={(childName) => onSelectPerson(generationIndex + 1, childName)}
            placeholder="Ajouter un enfant..."
            createLabel="Créer"
          />
        </div>
      </div>
    </div>
  );
}