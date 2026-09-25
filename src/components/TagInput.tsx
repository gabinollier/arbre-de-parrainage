import { X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TagInput({ 
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

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

  // Calcule la position de la liste déroulante à l'ouverture,
  // pour la rendre en portail et ainsi passer au-dessus de l'aperçu du graphe
  useLayoutEffect(() => {
    if (!isDropdownOpen) {
      setDropdownPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    // Repositionne si la fenêtre change (redimensionnement des panneaux, ...)
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isDropdownOpen]);

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
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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
              className="text-blue-600  hover:text-black transition-colors"
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
          className="flex-1 min-w-[120px] outline-none bg-transparent pl-1"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>

      {isDropdownOpen && dropdownPosition && createPortal(
        <div
          className="fixed z-[1000] bg-white border border-gray-200 rounded-xl shadow-md max-h-96 overflow-y-auto"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
        >
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
                  } ${option.startsWith(createLabel) ? 'text-green-600 font-medium' : 'text-slate-900'}`}
                >
                  {option}
                </button>
              ))}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}