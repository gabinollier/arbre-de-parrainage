import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({ isOpen, onClose, title, children, className = "w-96 max-w-[90vw]" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}