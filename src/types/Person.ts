// This class is ONLY used in the process of generating the DOT representation of the family tree.
// JSON data is converted into instances of this class for easier manipulation but immediately forgotten afterwards.
// It is NOT used in the application state or anywhere else.

export class Person {
  name: string;
  generation: number;
  children: Person[];
  parents: Person[];
  position: (number | null)[];
  color: string | null;
  joins: number;
  title: string | null;
  invisible: boolean;
  sortablePosition?: number[];

  constructor(
    name: string,
    generation: number,
    joins: number,
    children: Person[] = [],
    parents: Person[] = [],
    title: string | null = null,
    invisible: boolean = false
  ) {
    this.name = name;
    this.generation = generation;
    this.children = children;
    this.parents = parents;
    this.position = [null];
    this.color = null;
    this.joins = joins;
    this.title = title;
    this.invisible = invisible;
  }

  toString(): string {
    return `Person(name=${this.name}, generation=${this.generation}, children=[${this.children.map(c => c.name).join(', ')}], parents=[${this.parents.map(p => p.name).join(', ')}], position=[${this.position.join(', ')}], color=${this.color})`;
  }
}