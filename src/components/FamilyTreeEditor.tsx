"use client";

import { useState } from "react";
import { FamilyData } from "../types/familyTree";
import GenerationsPanel from "./GenerationsPanel";
import GenerationPanel from "./GenerationPanel";
import PersonPanel from "./PersonPanel";
import AddPersonModal from "./modals/AddPersonModal";

type FamilyTreeEditorProps = {
  data: FamilyData;
  onDataChange: (newData: FamilyData) => void;
};

export default function FamilyTreeEditor({ data, onDataChange }: FamilyTreeEditorProps) {
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
    if (selectedGeneration === null) {
      return;
    }

    const newData = { ...data };
    const generation = { ...newData.children_tree[selectedGeneration] };
    generation[name] = {
      children: [],
      ...(title && { title }),
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
      
      <GenerationPanel
        generation={currentGeneration}
        generationIndex={selectedGeneration}
        selectedPerson={selectedPerson}
        onSelectPerson={handleSelectPerson}
        onAddPerson={() => setShowAddPersonModal(true)}
        onDeleteGeneration={(index) => {
          const newData = { ...data };
          newData.children_tree.splice(index, 1);
          onDataChange(newData);
        }}
      />
      
      <PersonPanel
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
};

