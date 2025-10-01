import { useState } from "react";
import Modal from "../Modal";
import { Trash } from "lucide-react";

export default function DeletePersonModal({ isOpen, onClose, OnDeletePerson, personName, generationIndex }: {
  isOpen: boolean;
  onClose: () => void;
  OnDeletePerson: (name: string, generationIndex: number) => void;
  personName: string;
  generationIndex: number;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Êtes-vous sûr ?">
      <form onSubmit={() => OnDeletePerson(personName, generationIndex)}>
        <p className="mb-4">Voulez-vous vraiment supprimer <span className="font-semibold">{personName}</span> dans la génération {generationIndex+1} ? Cette action est irréversible.</p>
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
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex-1 flex items-center justify-center flex-row"
          >
            <Trash className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </form>
    </Modal>
  );
}