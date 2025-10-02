'use client';

import Modal from "../Modal";
import HowItWorks from "../HowItWorks";

type HowItWorksModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comment ça fonctionne ?"
      className="w-full max-w-4xl max-h-[95vh]"
    >
      <div className="max-h-[78vh] overflow-y-auto pr-1">
        <HowItWorks />
      </div>
    </Modal>
  );
}
