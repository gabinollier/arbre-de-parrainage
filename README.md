# Web app de création d'arbre de parrainage

## Résumé

En école d'ingénieur, il est courant que les étudiants en première année soient parrainés par des étudiants plus âgés.
Ces étudiants deviennent eux-même des parrains à leur tour lorsqu'ils passent en deuxième année.
Cela crée une sorte d'arbre généalogique des étudiants, mais en plus complexe (possibilité d'avoir plus de deux parrains, etc).
Cette application web a été créée pour permettre aux étudiants de mon école de créer et d'éditer de tels arbres graphiquement.

Les données sont importées et exportées au format JSON (de sorte que, même si l'interface web venait à disparaître, les données resteraient exploitables par les étudiants dans le futur).

L'arbre en lui même est exporté en PDF, ce qui permet de le partager facilement dans un groupe de promo et de pouvoir zoomer dedans (les formats image classiques sont compressés par les réseaux sociaux et ne permettent pas de zoomer sans perte de qualité).

## Stack technique

L'application est développée en React avec TypeScript et en Next.js.
Elle utilise viz.js (qui est une version de Graphviz compilée en WebAssembly) pour générer un svg de l'arbre à partir des données JSON, et jsPDF pour exporter le svg en PDF.
