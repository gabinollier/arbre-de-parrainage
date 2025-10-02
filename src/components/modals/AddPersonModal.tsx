import { useState } from "react";
import Modal from "../Modal";
import { isNameValid, isTitleValid } from "@/utils/FieldChecker";
import { useData } from "@/context/DataContext";

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle (optionnel)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              const { valid, error } = isTitleValid(value);
              if (!valid) {
                setTitleError(error ?? "Rôle invalide.");
              } else {
                setTitleError(null);
              }
            }}
            className={`w-full p-2 pl-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${titleError ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="Resp, Trésorier, ..."
          />
          {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
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