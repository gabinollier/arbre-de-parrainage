import { PersonData, ChildrenTree } from "../../types/familyTree";
import { Person } from "../../types/Person";
import { getFrenchOrdinalName } from "./frenchUtils";
import { isLightColor } from "./colorUtils";

// Color conversion utilities
function hexToRgb(hexColor: string): [number, number, number] {
    const hex = hexColor.replace('#', '');
    return [
        parseInt(hex.substr(0, 2), 16) / 255.0,
        parseInt(hex.substr(2, 2), 16) / 255.0,
        parseInt(hex.substr(4, 2), 16) / 255.0
    ];
}

function rgbToHex(rgb: [number, number, number]): string {
    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff) % 6;
        } else if (max === g) {
            h = (b - r) / diff + 2;
        } else {
            h = (r - g) / diff + 4;
        }
    }
    h = h / 6;
    if (h < 0) h += 1;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, s, v];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) {
        [r, g, b] = [c, x, 0];
    } else if (h < 2/6) {
        [r, g, b] = [x, c, 0];
    } else if (h < 3/6) {
        [r, g, b] = [0, c, x];
    } else if (h < 4/6) {
        [r, g, b] = [0, x, c];
    } else if (h < 5/6) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }
    
    return [r + m, g + m, b + m];
}

function addColorsInformation(generations: Person[][], colors: string[]): Person[][] {
    /**
     * Assigns colors to Person objects in the family tree.
     * First generation gets unique colors, descendants inherit parent colors.
     * 
     * Args:
     *     generations: Array of arrays of Person objects
     *     colors: Array of color strings
     * 
     * Returns:
     *     The same generations array with colors assigned to Person objects
     */
    
    function blendColors(colorList: string[]): string {
        if (colorList.length === 1) {
            return colorList[0];
        }
        
        let hsvColors = colorList.map(color => rgbToHsv(...hexToRgb(color)));
        
        // Remove duplicates by converting to string and back
        const uniqueHsvStrings = Array.from(new Set(hsvColors.map(hsv => JSON.stringify(hsv))));
        hsvColors = uniqueHsvStrings.map(str => JSON.parse(str));
        
        let avgH: number;
        if (hsvColors.length === 2) {
            const hueA = hsvColors[0][0];
            const hueB = hsvColors[1][0];
            if (Math.abs(hueA - hueB) >= 0.5) {
                avgH = ((hueA + hueB + 1) / 2) % 1.0;
            } else {
                avgH = (hueA + hueB) / 2;
            }
        } else {
            avgH = hsvColors.reduce((sum, hsv) => sum + hsv[0], 0) / hsvColors.length;
        }
        
        const avgS = hsvColors.reduce((sum, hsv) => sum + hsv[1], 0) / hsvColors.length;
        const avgV = hsvColors.reduce((sum, hsv) => sum + hsv[2], 0) / hsvColors.length;
        
        const avgRgb = hsvToRgb(avgH, avgS, avgV);
        return rgbToHex(avgRgb);
    }
    
    let colorIndex = 0; // Track which orphan color to use next
    
    // Assign colors to the first generation
    for (const person of generations[0]) {
        person.color = colors[colorIndex % colors.length];
        colorIndex += 1;
    }
    
    // Process each generation
    for (let genIdx = 0; genIdx < generations.length; genIdx++) {
        const generation = generations[genIdx];
        for (const person of generation) {
            if (person.parents.length === 0) {
                person.color = colors[colorIndex % colors.length];
                colorIndex += 1;
            } else {
                // If person has parents, blend their colors
                const parentColors = person.parents
                    .map(parent => parent.color)
                    .filter(color => color !== null) as string[];
                person.color = parentColors.length > 0 ? blendColors(parentColors) : null;
            }
        }
    }
    
    return generations;
}

export function generateDot(data: any): string {
    const sortedData = sortData(data.children_tree);
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
    const coloredData = addColorsInformation(sortedData, colors);
    return generateDotFromGenerations(coloredData, data.first_year, false);
}

function generateDotFromGenerations(generations: Person[][], firstYear: number, showDebugInfos: boolean = false): string {
    /**
     * Generate DOT script from list of lists of Person objects without using Graphviz library
     * 
     * Args:
     *     generations: Array of arrays of Person objects
     *     firstYear: The first year for generation labels
     *     showDebugInfos: If true, display position information below names
     * 
     * Returns:
     *     DOT script as a string
     */
    
    function quoteNodeName(name: string): string {
        return `"${name}"`;
    }
    
    const numberOfPersonPerTree: Map<number, number> = new Map();
    for (const generation of generations) {
        for (const person of generation) {
            const treePos = person.position[0]!;
            const count = numberOfPersonPerTree.get(treePos) || 0;
            numberOfPersonPerTree.set(treePos, count + 1);
        }
    }

    // Start building DOT script
    const dotLines: string[] = [];
    dotLines.push("digraph {");
    dotLines.push("\trankdir=TB");
    dotLines.push("\tsplines=spline");
    dotLines.push("\tnodesep=0.5");
    
    // nodes_for_ranking[i] will store node_ids belonging to generation i
    const nodesForRanking: Set<string>[] = Array(generations.length + 1).fill(null).map(() => new Set<string>());
    
    // Create invisible anchor node
    const anchorNodeId = "anchor_invisible";
    dotLines.push(`\t${anchorNodeId} [arrowhead=none height=0 style=invisible width=0]`);
    
    // Create generation labels
    const generationLabels: string[] = [];
    for (let genIdx = 0; genIdx < generations.length; genIdx++) {
        const genLabel = `<<B>${getFrenchOrdinalName(genIdx + 1, true)} génération</B> (${firstYear + genIdx} - ${firstYear + genIdx + 5}) >`;
        const genNodeId = `gen_label_${genIdx}`;
        
        // Generation label doesn't need quotes around it, just put it directly
        dotLines.push(`\t${genNodeId} [label=${genLabel} fillcolor=lightgrey fixedsize=true fontweight=bold penwidth=4 shape=box style="filled,rounded" width=4]`);
        
        // Create invisible spacer node
        const spacerNode = `spacer_${genIdx}`;
        dotLines.push(`\t${spacerNode} [label="" arrowhead=none height=0 style=invisible width=0]`);
        
        // Add invisible edge from anchor to spacer or previous spacer
        if (genIdx === 0) {
            dotLines.push(`\t${anchorNodeId} -> ${spacerNode} [arrowhead=none height=0 style=invisible width=0]`);
        } else {
            const prevSpacer = `spacer_${genIdx - 1}`;
            dotLines.push(`\t${prevSpacer} -> ${spacerNode} [arrowhead=none height=0 style=invisible width=0]`);
        }

        // Connect spacer to generation label with invisible edge
        dotLines.push(`\t${spacerNode} -> ${genNodeId} [arrowhead=none height=0 style=invisible width=0]`);

        generationLabels.push(genNodeId);
        nodesForRanking[genIdx].add(genNodeId);
        nodesForRanking[genIdx].add(spacerNode);
    }

    // Add people nodes
    for (let iGeneration = 0; iGeneration < generations.length; iGeneration++) {
        const generation = generations[iGeneration];
        for (const person of generation) {
            const personId = `${person.name}_${iGeneration}`;
            const quotedPersonId = quoteNodeName(personId);
            
            if (person.invisible) {
                dotLines.push(`\t${quotedPersonId} [fixedsize=true height=0 label="" style=invisible width=0]`);
            } else {
                let label: string;
                if (showDebugInfos) {
                    label = `${person.name}<FONT POINT-SIZE="8"><br/>[${person.position.join(', ')}]<br/>joins: ${person.joins}</FONT>`;
                } else if (person.title !== null) {
                    label = `${person.name}<FONT POINT-SIZE="8"><br/>${person.title}</FONT>`;
                } else {
                    label = person.name;
                }
                
                let borderWidth = '1';
                if (person.title === "Resp") {
                    borderWidth = '4';
                } else if (person.title !== null) {
                    borderWidth = '2.5';
                }

                // Format color with quotes if it's a hex color
                const color = person.color!.startsWith('#') ? `"${person.color}"` : person.color!;
                const fontColor = isLightColor(person.color!) ? 'black' : 'white';
                
                dotLines.push(`\t${quotedPersonId} [label=<${label}> fillcolor=${color} fontcolor=${fontColor} penwidth=${borderWidth} shape=box style="filled,rounded"]`);
            }
            
            nodesForRanking[iGeneration].add(personId);
        }
    }

    // Add edges between people
    const edges = new Set<string>(); // To track added edges and avoid duplicates
    for (let iGeneration = 0; iGeneration < generations.length; iGeneration++) {
        const generation = generations[iGeneration];
        for (const person of generation) {
            const personId = `${person.name}_${iGeneration}`;
            const quotedPersonId = quoteNodeName(personId);
            for (const child of person.children) {
                const childId = `${child.name}_${child.generation}`;
                const quotedChildId = quoteNodeName(childId);
                const edgeKey = `${personId}->${childId}`;
                if (!edges.has(edgeKey)) {
                    if (!person.invisible && !child.invisible) {
                        dotLines.push(`\t${quotedPersonId} -> ${quotedChildId} [weight=1000]`);
                    } else {
                        dotLines.push(`\t${quotedPersonId} -> ${quotedChildId} [arrowhead=none style=invisible weight=500]`);
                    }
                    edges.add(edgeKey);
                }
            }
        }
    }

    // Enforce horizontal ordering of each generation
    for (let genIdx = 0; genIdx < generations.length; genIdx++) {
        const generation = generations[genIdx];
        for (let iPerson = 0; iPerson < generation.length - 1; iPerson++) {
            const prevPerson = generation[iPerson];
            const prevNodeId = `${prevPerson.name}_${genIdx}`;
            const quotedPrevNodeId = quoteNodeName(prevNodeId);
            const nextPerson = generation[iPerson + 1];
            const nextNodeId = `${nextPerson.name}_${genIdx}`;
            const quotedNextNodeId = quoteNodeName(nextNodeId);

            let distance = '1';
            if (prevPerson.position[0] !== nextPerson.position[0]) {
                const treeId1 = prevPerson.position[0]!;
                const treeId2 = nextPerson.position[0]!;
                const size1 = numberOfPersonPerTree.get(treeId1) || 0;
                const size2 = numberOfPersonPerTree.get(treeId2) || 0;
                distance = String(2 + 0.4 * Math.sqrt(size1 + size2));
            }
            dotLines.push(`\t${quotedPrevNodeId} -> ${quotedNextNodeId} [arrowhead=none minlen=${distance} style=invisible weight=1]`);
        }
    }

    // Apply generation ranking using subgraphs
    for (let genIdx = 0; genIdx < nodesForRanking.length; genIdx++) {
        const nodesInGen = nodesForRanking[genIdx];
        if (nodesInGen.size > 0) {
            dotLines.push(`\t{`);
            dotLines.push(`\t\trank=same`);
            for (const nodeId of nodesInGen) {
                const quotedNodeId = quoteNodeName(nodeId);
                dotLines.push(`\t\t${quotedNodeId}`);
            }
            dotLines.push(`\t}`);
        }
    }

    dotLines.push("}");
    
    return dotLines.join('\n');
}

function _sortPersonPerPosition(persons: Person[]): void {
    if (!persons || persons.length === 0) {
        return;
    }
    
    const maxPosLength = Math.max(...persons.map(p => p.position.length));
    for (const p of persons) {
        p.sortablePosition = [...p.position, ...Array(maxPosLength - p.position.length).fill(0)];
    }

    persons.sort((a, b) => {
        if (!a.sortablePosition || !b.sortablePosition) return 0;
        for (let i = 0; i < a.sortablePosition.length; i++) {
            const aVal = a.sortablePosition[i] || 0;
            const bVal = b.sortablePosition[i] || 0;
            if (aVal !== bVal) {
                return aVal - bVal;
            }
        }
        return 0;
    });
}

function _sortChildren(children: Person[]): Person[] {
    // Identifier les groupes de co-parrains (personnes qui partagent exactement les mêmes enfants)
    const coparrainGroups: Person[][] = [];
    const processedChildren = new Set<Person>();
    
    for (const child of children) {
        if (processedChildren.has(child)) {
            continue;
        }
        
        // Trouver tous les co-parrains de cet enfant
        const coparrains: Person[] = [child];
        const childBizs = new Set(child.children.map(c => c.name));
        
        for (const otherChild of children) {
            if (otherChild !== child && !processedChildren.has(otherChild)) {
                const otherBizs = new Set(otherChild.children.map(c => c.name));
                // Co-parrains = même ensemble d'enfants ET au moins un enfant en commun
                const setsEqual = childBizs.size === otherBizs.size && 
                                [...childBizs].every(x => otherBizs.has(x));
                if (setsEqual && childBizs.size > 0) {
                    coparrains.push(otherChild);
                }
            }
        }
        
        // Marquer tous les co-parrains comme traités
        for (const coparrain of coparrains) {
            processedChildren.add(coparrain);
        }
        
        coparrainGroups.push(coparrains);
    }
    
    // Calculer le score de chaque groupe pour le tri
    // Score = (nb_parents_moyen, nb_children_total_du_groupe)
    function groupScore(group: Person[]): [number, number, number] {
        const totalJoins = group.reduce((sum, child) => sum + child.joins, 0);
        const totalParents = group.reduce((sum, child) => sum + child.parents.length, 0);
        const totalChildren = group.reduce((sum, child) => sum + child.children.length, 0);
        return [totalJoins, totalParents, totalChildren];
    }
    
    // Trier les groupes selon leur score
    coparrainGroups.sort((a, b) => {
        const scoreA = groupScore(a);
        const scoreB = groupScore(b);
        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] !== scoreB[i]) {
                return scoreA[i] - scoreB[i];
            }
        }
        return 0;
    });
    
    // Appliquer l'algorithme de placement en pyramide inversée sur les groupes
    let newChildren: Person[] = [];
    for (const group of coparrainGroups) {
        // Trier les co-parrains dans le groupe par nombre de parents puis enfants
        group.sort((a, b) => {
            if (a.parents.length !== b.parents.length) {
                return a.parents.length - b.parents.length;
            }
            return a.children.length - b.children.length;
        });
        
        if (newChildren.length % 2 === 0) {
            // Ajouter le groupe à droite (à la fin)
            newChildren = newChildren.concat(group);
        } else {
            // Ajouter le groupe à gauche (au début)
            newChildren = group.concat(newChildren);
        }
    }
    
    // Normaliser l'emplacement du groupe le plus "prometteur"
    // Si le nombre de groupes est impair, renverser pour que le plus prometteur soit au début
    const totalGroups = coparrainGroups.length;
    if (totalGroups % 2 === 1) {
        newChildren = newChildren.reverse();
    }

    return newChildren;
}

function sortData(data: ChildrenTree): Person[][] {
    // Create persons without the children and parents
    const generations: Person[][] = Array(data.length).fill(null).map(() => []);
    
    for (let generationIndex = 0; generationIndex < data.length; generationIndex++) {
        const generation = data[generationIndex];
        for (const personName of Object.keys(generation)) {
            const title = data[generationIndex][personName].title || null;
            const person = new Person(personName, generationIndex, 0, [], [], title);
            generations[generationIndex].push(person);
        }
    }

    // Add children
    for (const generation of generations) {
        for (const person of generation) {
            if (person.invisible) {
                continue;
            }

            const childrenNames = data[person.generation][person.name].children;
            if (person.generation + 1 < generations.length) {
                const children = generations[person.generation + 1].filter(p => 
                    childrenNames.includes(p.name)
                );
                person.children = children;

                if (childrenNames.length === 0) {
                    // we add a dummy invisible child. This is purely for aesthetic purposes
                    const dummyChild = new Person(
                        `inv_${person.name}`, 
                        person.generation + 1, 
                        0, 
                        [], 
                        [], 
                        null, 
                        true
                    );
                    person.children = [dummyChild];
                    generations[person.generation + 1].push(dummyChild);
                }
            }
        }
    }

    // Add parents
    for (const generation of generations) {
        for (const person of generation) {
            if (person.generation > 0) {
                const parents = generations[person.generation - 1].filter(p => 
                    p.children.includes(person)
                );
                person.parents = parents;
            }
        }
    }

    // Check le nombre de jointures dont vont être responsable chaque personne.
    // (Une 'jointure' est un réunion de deux arbres qui étaient distincts avant, 
    // mais qui ont été réunis par deux personnes qui ont pris un biz en commun)
    for (let i = 0; i < generations.length; i++) {
        const iGeneration = generations.length - 1 - i;
        const generation = generations[iGeneration];
        for (const person of generation) {
            person.joins += person.children.reduce((sum, c) => sum + c.joins, 0);
            if (person.parents.length > 1) {
                person.joins += person.parents.length - 1;
            }
        }
    }

    let nextAvailableMainPos = 0;

    // Init first generation positions
    const sortedFirstGen = [...generations[0]].sort((a, b) => b.children.length - a.children.length);
    for (const person of sortedFirstGen) {
        person.position = [nextAvailableMainPos];
        nextAvailableMainPos += 1;
    }

    // Propagate positions downwards
    for (let iGeneration = 0; iGeneration < generations.length; iGeneration++) {
        const generation = generations[iGeneration];
        _sortPersonPerPosition(generation);
        
        for (const person of generation) {
            const sortedChildren = _sortChildren(person.children);

            const placeChildrenOnSameSide = person.children.some(child => child.position[0] !== null);
            
            for (let iChild = 0; iChild < sortedChildren.length; iChild++) {
                const child = sortedChildren[iChild];
                if (child.position[0] === null) {
                    // compute the child sub-position
                    let childSubPosition: number;
                    
                    if (placeChildrenOnSameSide) {
                        if (person.position[person.position.length - 1]! < 0) {
                            childSubPosition = person.position[person.position.length - 1]! - 1 - iChild;
                        } else {
                            childSubPosition = person.position[person.position.length - 1]! + 1 + iChild;
                        }
                    } else {
                        // s'il y a un nombre impair d'enfants, celui du milieu aura une subposition du même signe que son parent
                        childSubPosition = iChild - Math.ceil(sortedChildren.length / 2);
                        if (childSubPosition >= 0) {
                            childSubPosition += 1;
                        }

                        if (person.position[person.position.length - 1]! > 0) {
                            childSubPosition *= -1;
                        }
                    }
                    
                    child.position = [...person.position, childSubPosition];

                    if (person.children.length === 1) {
                        child.position = [...person.position];
                    }

                    // give the child sub position to every other parent's tree
                    for (const parent of child.parents) {
                        if (parent !== person && parent.position[0] !== child.position[0]) {
                            
                            if (child.position.length === 1) {
                                child.position = [child.position[0], 1];
                            }

                            // Compute next available subposition
                            if (child.position[child.position.length - 1]! >= 0) {
                                child.position[child.position.length - 1] = child.position[child.position.length - 1]! + 1;
                            } else {
                                child.position[child.position.length - 1] = child.position[child.position.length - 1]! - 1;
                            }

                            // On parcours TOUT L'ARBRE pour mettre à jour les positions
                            const treePosToUpdate = parent.position[0];
                            const shouldReverseTree = (parent.position[parent.position.length - 1]! > 0) === (child.position[child.position.length - 1]! > 0);
                            
                            for (const gen of generations) {
                                for (const p of gen) {
                                    if (p !== child && p.position[0] === treePosToUpdate) {
                                        let hack = 1000 + iGeneration;
                                        if (child.position[child.position.length - 1]! <= 0) {
                                            hack *= -1;
                                        }
                                        if (p.position.length > 1) {
                                            // preserve previous subpositions
                                            if (shouldReverseTree) {
                                                p.position = [child.position[0], hack, ...child.position.slice(1), ...p.position.slice(1).map(x => -x!)];
                                            } else {
                                                p.position = [child.position[0], hack, ...child.position.slice(1), ...p.position.slice(1)];
                                            }
                                        } else {
                                            p.position = [child.position[0], hack, ...child.position.slice(1)];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // If some persons have no position (orphans), assign them sequentially after the last positioned person
        if (iGeneration + 1 < generations.length) {
            const nextGen = [...generations[iGeneration + 1]].sort((a, b) => b.children.length - a.children.length);
            for (const person of nextGen) {
                if (person.position[0] === null) {
                    person.position = [nextAvailableMainPos];
                    nextAvailableMainPos += 1;
                }
            }
        }
    }

    // Calculate the number of person per tree (one tree being one position[0])
    // and re-index all tree positions to be sequential (0, 1, 2, ...), 0 being the bigger (with the most persons)
    const treeSizes: Map<number, number> = new Map();
    for (const gen of generations) {
        for (const person of gen) {
            const treePos = person.position[0]!;
            treeSizes.set(treePos, (treeSizes.get(treePos) || 0) + 1);
        }
    }

    const sortedTrees = Array.from(treeSizes.entries()).sort((a, b) => b[1] - a[1]);
    const treeIndexMapping: Map<number, number> = new Map();
    for (let i = 0; i < sortedTrees.length; i++) {
        const [oldIdx, _] = sortedTrees[i];
        treeIndexMapping.set(oldIdx, i);
    }

    for (const gen of generations) {
        for (const person of gen) {
            person.position[0] = treeIndexMapping.get(person.position[0]!)!;
        }
    }

    for (const gen of generations) {
        _sortPersonPerPosition(gen);
    }

    // Return the generations as lists of Person objects
    return generations;
}