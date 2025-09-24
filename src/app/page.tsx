"use client";

import { useState, useRef, useEffect } from "react";
import { instance } from "@viz-js/viz";
import { generateDot } from "./utils/generateDot";
import { validateData } from "./utils/validateData";
import { 
  Upload, 
  X, 
  AlertCircle, 
  FileText, 
  Download, 
  FileDown, 
  Edit3, 
  BarChart3, 
  Loader2,
  RotateCcw,
  Plus,
  ChevronRight,
  UsersRound,
  UserRound,
  TextAlignStart,
  Trash,
  Network
} from "lucide-react";

// TagInput Component
function TagInput({ 
  tags, 
  availableOptions, 
  onAddTag, 
  onRemoveTag, 
  onSelectTag,
  placeholder = "Ajouter...",
  createLabel = "Créer"
}: {
  tags: string[];
  availableOptions: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSelectTag: (tag: string) => void;
  placeholder?: string;
  createLabel?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = availableOptions.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Correction : "Créer" n'apparaît que si la recherche n'est contenue dans aucun nom
  const shouldShowCreateOption = inputValue.trim() &&
    !availableOptions.some(option => option.toLowerCase().includes(inputValue.trim().toLowerCase())) &&
    !tags.includes(inputValue.trim());

  const allOptions = [...filteredOptions];
  if (shouldShowCreateOption) {
    allOptions.unshift(`${createLabel} "${inputValue.trim()}"`);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsDropdownOpen(true);
    setFocusedIndex(0);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, allOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allOptions.length > 0) {
          handleSelectOption(allOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectOption = (option: string) => {
    if (option.startsWith(createLabel)) {
      // Extract the name from "Créer "name""
      const name = inputValue.trim();
      onAddTag(name);
    } else {
      // Ajout du tag, pas navigation
      onAddTag(option);
    }
    setInputValue("");
    setIsDropdownOpen(false);
    setFocusedIndex(0);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {tags.map(tag => (
          <div
            key={tag}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 pl-2.5 pr-2 py-1 rounded-md text-sm"
          >
            <button
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </button>
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-blue-600  hover:text-black transition-colors rounded-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-96 overflow-y-auto">
          {allOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {inputValue ? "Aucun résultat" : "Sélectionnez ou créez un élément"}
            </div>
          ) : (
            <>
              {!inputValue && (
                <div className="px-3 py-2 text-gray-500 text-sm border-b border-gray-100">
                  Sélectionnez ou créez un élément
                </div>
              )}
              {allOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${
                    index === focusedIndex ? 'bg-blue-50' : ''
                  } ${option.startsWith(createLabel) ? 'text-green-600 font-medium' : ''}`}
                >
                  {option}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Types
interface Person {
  children: string[];
  title?: string;
}

interface Generation {
  [name: string]: Person;
}

interface FamilyData {
  first_year: number;
  children_tree: Generation[];
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Add Person Modal Component
function AddPersonModal({ isOpen, onClose, onAdd, defaultName = "" }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, title: string) => void;
  defaultName?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), title.trim());
      setName("");
      setTitle("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une personne">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom de la personne"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle (optionnel)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resp, Trésorier, ..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Generations Panel Component
function GenerationsPanel({ data, selectedGeneration, onSelectGeneration, onAddGeneration }: {
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

// Generation Members Panel Component
function GenerationMembersPanel({ 
  generation, 
  generationIndex, 
  selectedPerson, 
  onSelectPerson, 
  onAddPerson 
}: {
  generation: Generation | null;
  generationIndex: number | null;
  selectedPerson: string | null;
  onSelectPerson: (name: string) => void;
  onAddPerson: () => void;
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

// Person Editor Panel Component
function PersonEditorPanel({ 
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

// Main Family Tree Editor Component
function FamilyTreeEditor({ data, onDataChange }: {
  data: FamilyData;
  onDataChange: (newData: FamilyData) => void;
}) {
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  const handleSelectGeneration = (index: number) => {
    setSelectedGeneration(index);
    setSelectedPerson(null);
  };

  const handleSelectPerson = (generationIndex: number | null, personName: string | null) => {
    setSelectedGeneration(generationIndex);
    setSelectedPerson(personName);
  };

  const handleAddGeneration = () => {
    const newData = { ...data };
    newData.children_tree.push({});
    onDataChange(newData);
    setSelectedGeneration(newData.children_tree.length - 1);
  };

  const handleAddPerson = (name: string, title: string) => {
    if (selectedGeneration === null) return;
    
    const newData = { ...data };
    const generation = { ...newData.children_tree[selectedGeneration] };
    generation[name] = {
      children: [],
      ...(title && { title })
    };
    newData.children_tree[selectedGeneration] = generation;
    onDataChange(newData);
    setSelectedPerson(name);
  };

  const currentGeneration = selectedGeneration !== null ? data.children_tree[selectedGeneration] : null;

  return (
    <div className="h-full flex">
      <GenerationsPanel
        data={data}
        selectedGeneration={selectedGeneration}
        onSelectGeneration={handleSelectGeneration}
        onAddGeneration={handleAddGeneration}
      />
      
      <GenerationMembersPanel
        generation={currentGeneration}
        generationIndex={selectedGeneration}
        selectedPerson={selectedPerson}
        onSelectPerson={setSelectedPerson}
        onAddPerson={() => setShowAddPersonModal(true)}
      />
      
      <PersonEditorPanel
        data={data}
        generationIndex={selectedGeneration}
        personName={selectedPerson}
        onDataChange={onDataChange}
        onSelectPerson={handleSelectPerson}
      />

      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
        onAdd={handleAddPerson}
      />
    </div>
  );
}

export default function Home() { 
  const [dotInput, setDotInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isValidData, setIsValidData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const graphRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      setError("Veuillez sélectionner un fichier JSON valide.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate required properties
        if (!jsonData.children_tree) {
          setError("Le fichier JSON doit contenir une propriété 'children_tree'.");
          return;
        }
        
        if (jsonData.first_year === undefined || jsonData.first_year === null) {
          setError("Le fichier JSON doit contenir une propriété 'first_year'.");
          return;
        }
        
        if (typeof jsonData.first_year !== 'number' || !Number.isInteger(jsonData.first_year)) {
          setError("La propriété 'first_year' doit être un nombre entier.");
          return;
        }
        
        // Validate the children_tree structure
        const validation = validateData(jsonData.children_tree);
        if (!validation.isValid) {
          setError("Données invalides : " + validation.error);
          setIsValidData(false);
          return;
        }
        
        setUploadedData(jsonData);
        setIsValidData(true);
        setIsInitialLoad(true); // This is an initial load, reset zoom
        
        const generatedDot = generateDot(jsonData);
        setDotInput(generatedDot);
        
        setError("");
      } catch (err) {
        setError("Erreur lors de la lecture du fichier JSON : " + (err as Error).message);
      }
    };
    
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
    };
    
    reader.readAsText(file);
  };

  const clearUpload = () => {
    setUploadedData(null);
    setFileName("");
    setDotInput("");
    setError("");
    setIsValidData(false);
    setIsInitialLoad(true); // Reset for next file load
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleDataChange = (newData: any) => {
    setUploadedData(newData);
    setIsInitialLoad(false); // This is an edit, preserve zoom
    
    // Generate new DOT
    const generatedDot = generateDot(newData);
    setDotInput(generatedDot);
  };

  const downloadDataAsJson = () => {
    if (!uploadedData) return;
    
    const dataStr = JSON.stringify(uploadedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = fileName.replace('.json', '_edited.json');
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderGraph = async (resetZoom: boolean = true) => {
    if (!dotInput) return;
    setIsLoading(true);

    try {
      const viz = await instance();
      const element = await viz.renderSVGElement(dotInput);

      if (graphRef.current) {
        graphRef.current.innerHTML = "";
        graphRef.current.appendChild(element);

        // Ajuste le zoom et le centrage au premier rendu
        if (resetZoom) {
          // Récupère la taille du conteneur et du SVG
          const container = graphContainerRef.current;
          const svg = element;
          if (container && svg) {
            // Prend la taille du conteneur
            const containerRect = container.getBoundingClientRect();
            // Prend la taille du SVG (via viewBox ou width/height)
            let svgWidth = 0, svgHeight = 0;
            const vb = svg.getAttribute('viewBox');
            if (vb) {
              const vbParts = vb.split(' ');
              svgWidth = parseFloat(vbParts[2]);
              svgHeight = parseFloat(vbParts[3]);
            } else {
              svgWidth = parseFloat(svg.getAttribute('width') || '0');
              svgHeight = parseFloat(svg.getAttribute('height') || '0');
            }
            // Calcule le zoom optimal
            const zoomX = containerRect.width / svgWidth;
            const zoomY = containerRect.height / svgHeight;
            const optimalZoom = Math.min(zoomX, zoomY, 1); // max 1 pour éviter le zoom excessif
            // Calcule le pan pour centrer
            const panX = (containerRect.width - svgWidth * optimalZoom) / 2;
            const panY = (containerRect.height - svgHeight * optimalZoom) / 2;
            setZoom(optimalZoom);
            setPan({ x: panX, y: panY });
          } else {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du rendu : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const container = graphContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the point in the current coordinate system
    const pointBeforeZoom = {
      x: (mouseX - pan.x) / zoom,
      y: (mouseY - pan.y) / zoom
    };
    
    const delta = e.deltaY * -0.002;
    const newZoom = Math.min(Math.max(0.05, zoom * (1 + delta)), 50);
    
    // Calculate new pan to keep the mouse point fixed
    const newPan = {
      x: mouseX - pointBeforeZoom.x * newZoom,
      y: mouseY - pointBeforeZoom.y * newZoom
    };
    
    setZoom(newZoom);
    setPan(newPan);
    
    // Force re-render of SVG to prevent pixelization
    if (graphRef.current) {
      const svgElement = graphRef.current.querySelector('svg');
      if (svgElement) {
        // Trigger a repaint by slightly modifying and restoring a CSS property
        const originalOpacity = svgElement.style.opacity;
        svgElement.style.opacity = '0.999';
        requestAnimationFrame(() => {
          svgElement.style.opacity = originalOpacity;
        });
      }
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Handle double click to reset zoom and pan
  const handleDoubleClick = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Auto-render graph when dotInput changes and data is valid
  useEffect(() => {
    if (isValidData && dotInput) {
      renderGraph(isInitialLoad);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [dotInput, isValidData, isInitialLoad]);

  // Global mouse event listeners for smoother dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      
      // Force SVG re-render during drag to prevent pixelization
      if (graphRef.current) {
        const svgElement = graphRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = 'translateZ(0)'; // Force hardware acceleration
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, lastMousePos]);

  // File upload view - shown when no valid data is loaded
  if (!isValidData) {
    return (
      <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Arbre Généalogique MIFF
          </h1>
          
          {/* File Upload Section */}
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Télécharger un fichier JSON
              </h2>
              <p className="text-gray-500 text-sm">
                Sélectionnez votre fichier de données familiales
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
              />
              
              {fileName && !isValidData && !error && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{fileName}</span>
                  <button
                    onClick={clearUpload}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">Erreur de validation</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main editor view - shown when valid data is loaded
  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-green-600 text-white px-2 py-2 shadow-md">
        <div className="flex items-center justify-between ml-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm">
              Fichier chargé : <span className="font-semibold">{fileName}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={downloadDataAsJson}
              className="text-sm flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter JSON
            </button>
            
            <button
              disabled
              className="text-sm flex items-center gap-2 px-4 py-2 bg-gray-500 rounded-lg transition-colors font-medium cursor-not-allowed opacity-50"
            >
              <FileDown className="w-4 h-4" />
              Exporter PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Top Panel - Data Editor */}
        <div className="h-3/5 bg-white border-b border-gray-200">
          <FamilyTreeEditor 
            data={uploadedData}
            onDataChange={handleDataChange}
          />
        </div>

        {/* Bottom Panel - Graph Preview */}
        <div className="h-2/5 bg-gray-50 flex flex-col">
          {/* Title bar */}
          <div className="bg-white px-6 py-2 flex items-center justify-between shadow-md">
            <h2 className="text-lg font-semibold text-gray-800">
              <Network className="w-5 h-5 inline-block mr-1" />
              Aperçu du graphique
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Génération...</span>
              </div>
            )}
          </div>
          {/* Graph container taking full remaining space */}
          <div className="flex-1 bg-white overflow-hidden relative">
              {!dotInput && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
                  <div>
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <p>Chargement du graphique...</p>
                  </div>
                </div>
              )}
              <div
                ref={graphContainerRef}
                className="w-full h-full overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div
                  ref={graphRef}
                  className="w-fit h-fit"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    imageRendering: zoom > 1 ? 'auto' : 'auto',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform'
                  }}
                >
                </div>
              </div>
              
              {/* Zoom controls */}
              {dotInput && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const newZoom = Math.min(50, zoom * 1.3);
                      setZoom(newZoom);
                      // Force SVG re-render to prevent pixelization
                      setTimeout(() => {
                        if (graphRef.current) {
                          const svgElement = graphRef.current.querySelector('svg');
                          if (svgElement) {
                            const originalOpacity = svgElement.style.opacity;
                            svgElement.style.opacity = '0.999';
                            requestAnimationFrame(() => {
                              svgElement.style.opacity = originalOpacity;
                            });
                          }
                        }
                      }, 0);
                    }}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Zoom avant"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newZoom = Math.max(0.05, zoom / 1.3);
                      setZoom(newZoom);
                      // Force SVG re-render to prevent pixelization
                      setTimeout(() => {
                        if (graphRef.current) {
                          const svgElement = graphRef.current.querySelector('svg');
                          if (svgElement) {
                            const originalOpacity = svgElement.style.opacity;
                            svgElement.style.opacity = '0.999';
                            requestAnimationFrame(() => {
                              svgElement.style.opacity = originalOpacity;
                            });
                          }
                        }
                      }, 0);
                    }}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Zoom arrière"
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  <button
                    onClick={() => renderGraph(true)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Recentrer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Zoom indicator */}
              {dotInput && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {Math.round(zoom * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );  
}
