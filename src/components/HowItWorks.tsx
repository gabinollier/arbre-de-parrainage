'use client';

import { type ReactNode } from "react";
import { CircleQuestionMark, Shuffle } from "lucide-react";

type StepRowProps = {
  step: number;
  children: ReactNode;
};

function StepRow({ step, children }: StepRowProps) {
  return (
    <div className="grid grid-cols-[120px_1fr]">
      <span className="flex items-center gap-3 text-green-600 font-semibold">
        Étape
        <span className="flex size-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
          {step}
        </span>
      </span>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-md flex flex-col gap-6">
      <div className="flex flex-col gap-5 text-base">
        <StepRow step={1}>
          <span className="font-bold">Récupérez le fichier .json</span> qui contient les données des années précédentes (sur le Google Drive de la miff).
          <span className="relative inline-flex group ml-2 align-sub">
            <CircleQuestionMark className="w-4 h-4 text-gray-400 hover:text-gray-700 transition-colors duration-200" />
            <span className="z-50 pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-700 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Si vous ne trouvez pas le fichier, demandez aux resps précédents où il se trouve.
            </span>
          </span>
        </StepRow>

        <StepRow step={2}>
          <span className="font-bold">Importez ce fichier</span> en cliquant sur le bouton "Parcourir" en haut à gauche.
        </StepRow>

        <StepRow step={3}>
          <span className="font-bold">Modifiez les données</span> grâce à l'éditeur.
          <span className="relative inline-flex group ml-2 align-sub">
            <CircleQuestionMark className="w-4 h-4 text-gray-400 hover:text-gray-700 transition-colors duration-200" />
            <div className="z-50 pointer-events-none absolute left-1/2 top-full max-w-200 mt-2 -translate-x-1/2 whitespace-normal rounded-lg bg-gray-700 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 w-[min(90vw,600px)]">
              Par exemple, vous pouvez commencer par mettre à jour les rôles des nouveaux resps, et du trésorier s'il y en a un.<br />
              Ensuite, vous pouvez rajouter leurs bizs aux gens qui en ont.<br />
              N'oubliez pas de rajouter les gens qui ont été rachetés dans la miff en cours d'année, et les bizs qui n'ont pas de parrains !
            </div>
          </span>
          <br />
          <p className="text-xs leading-tight mt-0.5">
            Attention : vos modifications ne sont pas sauvegardées tant que vous n'avez pas fait l'étape 5 ! Si vous rechargez la page, vous perdrez toutes vos modifications.
          </p>
        </StepRow>

        <StepRow step={4}>
          Optionnel : Si une des lignées dans l'aperçu ne vous plaît pas, cliquez sur le bouton "<Shuffle className="inline size-4 text-gray-700 align-sub mx-1" />" pour obtenir un agencement différent.
        </StepRow>

        <StepRow step={5}>
          <span className="font-bold">Cliquez sur "Sauvegarder JSON"</span> en haut à droite.<br />Mettez ce fichier là où vous aviez trouvé le précédent fichier (sur le Google Drive de la miff).
          <span className="relative inline-flex group ml-2 align-sub">
            <CircleQuestionMark className="w-4 h-4 text-gray-400 hover:text-gray-700 transition-colors duration-200" />
            <div className="z-50 pointer-events-none absolute left-1/2 top-full max-w-200 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-700 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Pensez aux resps de l'année prochaine ! Ils auront besoin de repartir de là où vous vous êtes arrêtés.
            </div>
          </span>
        </StepRow>

        <StepRow step={6}>
          <p>
            <span className="font-bold">Cliquez sur "Exporter PDF"</span> et partagez-le sur le groupe de la miff !
          </p>
        </StepRow>
      </div>
    </div>
  );
}
