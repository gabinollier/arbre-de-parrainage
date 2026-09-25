import { useState } from "react";
import Modal from "../Modal";
import { isNameValid, isTitleValid, isInvisibleRole, validateInvisibleRole } from "@/utils/FieldChecker";
import { useData } from "@/context/DataContext";
import HelpTooltip from "../HelpTooltip";

export default function AddPersonModal({ isOpen, onClose, onAdd, defaultName = "", generationIndex }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, title: string) => void;
  defaultName?: string;
  generationIndex: number | null;
}) {
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState("");
  const { familyData } = useData();
  const [nameError, setNameError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [titleWarning, setTitleWarning] = useState<string | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedTitle = title.trim();
    const { valid, error } = isTitleValid(trimmedTitle);
    if (!valid) {
      setTitleError(error ?? "Rôle invalide.");
      return;
    }
    setTitleError(null);
    if (isInvisibleRole(trimmedTitle)) {
      // Une nouvelle personne n'a encore ni parent ni enfant.
      setTitleWarning(validateInvisibleRole(0, 0).warning ?? null);
    } else {
      setTitleWarning(null);
    }
    if (trimmedName) {
      onAdd(trimmedName, trimmedTitle);
      setName("");
      setTitle("");
      setNameError(null);
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
            onChange={(e) => {
              setName(e.target.value)
              const { valid, error } = isNameValid(e.target.value, Object.keys(familyData?.children_tree[generationIndex ?? 0] || {}));

              if (!valid) {
                setNameError(error ?? "Nom invalide.");
              }
              else {
                setNameError(null);
              }
            }}
            className={`w-full p-2 pl-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${nameError ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="Nom de la personne"
            required
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>
        <div className="mb-5">
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              Rôle (optionnel)
            </label>
            <HelpTooltip>
              <ul className="list-disc pl-4 space-y-1">
                <li><span className="font-semibold">Resp</span> : bordure épaisse autour de la personne.</li>
                <li><span className="font-semibold">Trésorier</span> : bordure moyenne.</li>
                <li><span className="font-semibold">Invisible</span> : personne invisible dans le graphe, ses parrains/marraines sont relié·e·s directement à ses bizs (si elle en a plusieurs, chaque parrain·e est relié·e à chaque biz).</li>
                <li><span className="font-semibold">Autre rôle</span> : affiché sous le nom de la personne.</li>
              </ul>
            </HelpTooltip>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              const { valid, error } = isTitleValid(value);
              if (!valid) {
                setTitleError(error ?? "Rôle invalide.");
                setTitleWarning(null);
                return;
              }
              setTitleError(null);
              if (isInvisibleRole(value)) {
                setTitleWarning(validateInvisibleRole(0, 0).warning ?? null);
              } else {
                setTitleWarning(null);
              }
            }}
            className={`w-full p-2 pl-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${titleError ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="Resp, Trésorier, ..."
          />
          {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
          {titleWarning && <p className="text-amber-600 text-sm mt-1">{titleWarning}</p>}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 flex-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            className={"px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex-1"}
            disabled={!!nameError || !!titleError}
          >
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}