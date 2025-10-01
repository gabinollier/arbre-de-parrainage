import { useState } from "react";
import Modal from "../Modal";

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
        <p className="mb-4">Voulez-vous vraiment supprimer {personName} dans la génération {generationIndex+1} ? Cette action est irréversible.</p>
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </form>
    </Modal>
  );
}