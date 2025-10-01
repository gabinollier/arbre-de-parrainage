"use client";

import { useCallback, useState } from "react";
import { FamilyData } from "../types/familyTree";
import GenerationsPanel from "./GenerationsPanel";
import GenerationPanel from "./GenerationPanel";
import PersonPanel from "./PersonPanel";
import AddPersonModal from "./modals/AddPersonModal";
import { useData } from "../context/DataContext";
import DeletePersonModal from "./modals/DeletePersonModal";

export default function FamilyTreeEditor() {
  const { familyData, setFamilyData, setIsInitialLoad } = useData();
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [openCount, setOpenCount] = useState(0); // To force remount modal

  const [showDeletePersonModal, setShowDeletePersonModal] = useState(false);

  if (!familyData) {
    return null;
  }

  const handleDataChange = useCallback((newData: FamilyData) => {
    setFamilyData(newData);
    setIsInitialLoad(false);
  }, [setFamilyData, setIsInitialLoad]);

  const handleSelectGeneration = (index: number) => {
    setSelectedGeneration(index);
    setSelectedPerson(null);
  };

  const handleSelectPerson = (generationIndex: number | null, personName: string | null) => {
    setSelectedGeneration(generationIndex);
    setSelectedPerson(personName);
  };

  const handleAddGeneration = () => {
    const nextIndex = familyData.children_tree.length;
    setFamilyData((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        children_tree: [...previous.children_tree, {}],
      };
    });
    setSelectedGeneration(nextIndex);
    setSelectedPerson(null);
    setIsInitialLoad(false);
  };

  const handleAddPerson = (name: string, title: string) => {
    if (selectedGeneration === null) {
      return;
    }

    setFamilyData((previous) => {
      if (!previous) {
        return previous;
      }
      const nextTree = [...previous.children_tree];
      const generation = { ...nextTree[selectedGeneration], [name]: { children: [], ...(title ? { title } : {}) } };
      nextTree[selectedGeneration] = generation;
      return {
        ...previous,
        children_tree: nextTree,
      };
    });
    setSelectedPerson(name);
    setIsInitialLoad(false);
  };

  
  const handleDeleteGeneration = (index: number) => {
    setFamilyData((previous) => {
      if (!previous) {
        return previous;
      }
      const nextTree = previous.children_tree.filter((_, treeIndex) => treeIndex !== index);
      return {
        ...previous,
        children_tree: nextTree,
      };
    });
    setSelectedPerson(null);
    setSelectedGeneration((current) => {
      if (current === null) {
        return current;
      }
      if (current === index) {
        return null;
      }
      return current > index ? current - 1 : current;
    });
    setIsInitialLoad(false);
  };

  const currentGeneration = selectedGeneration !== null ? familyData.children_tree[selectedGeneration] : null;

  return (
    <div className="h-full flex">
      <GenerationsPanel
        data={familyData}
        selectedGeneration={selectedGeneration}
        onSelectGeneration={handleSelectGeneration}
        onAddGeneration={handleAddGeneration}
      />
      
      <GenerationPanel
        generation={currentGeneration}
        generationIndex={selectedGeneration}
        selectedPerson={selectedPerson}
        onSelectPerson={handleSelectPerson}
        onAddPerson={() => 
            {
                setShowAddPersonModal(true); 
                setOpenCount((prev) => prev + 1);
            }
        }
        onDeleteGeneration={handleDeleteGeneration}
      />
      
      <PersonPanel
        data={familyData}
        generationIndex={selectedGeneration}
        personName={selectedPerson}
        onDataChange={handleDataChange}
        onSelectPerson={handleSelectPerson}
      />

      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
        onAdd={handleAddPerson}
        generationIndex={selectedGeneration}
        key={openCount} // Force remount to reset internal state
      />
    </div>
  );
}

