// Contenedor para la red sintáctica
const syntaxNetworkContainer = document.getElementById("syntax-network");

/**
 * Obtiene un elemento del DOM por su ID.
 * @param {string} id - El ID del elemento.
 * @returns {HTMLElement} - El elemento del DOM.
 */
function getContainerElement(id) {
    return document.getElementById(id);
}

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Encuentra la palabra más común en un array de palabras.
 * @param {Array} words - El array de palabras.
 * @returns {string} - La palabra más común.
 */
function findMostCommonWordInText(words) {
    const wordFrequency = {};
    
    // Contar la frecuencia de cada palabra
    words.forEach(word => {
        const normalizedWord = word.toLowerCase(); // Convertir la palabra a minúsculas para evitar distinciones de mayúsculas y minúsculas
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    });
    
    // Encontrar la palabra con la frecuencia más alta
    let mostCommonWord = '';
    let highestFrequency = 0;
    
    for (const word in wordFrequency) {
        if (wordFrequency[word] > highestFrequency) {
            mostCommonWord = word;
            highestFrequency = wordFrequency[word];
        }
    }
    
    return mostCommonWord;
}

/**
 * Encuentra la palabra más común en un conjunto de nodos.
 * @param {Array} nodes - Los nodos a analizar.
 * @returns {Object} - El nodo más común.
 */
function findMostCommonWord(nodes) {
    return nodes.reduce((max, node) => {
        return node.frequency > max.frequency ? node : max;
    }, nodes[0]);
}


/**
 * Encuentra la palabra menos común en un conjunto de nodos.
 * @param {Array} nodes - Los nodos a analizar.
 * @returns {Object} - El nodo menos común.
 */
function findLeastCommonWord(nodes) {
    return nodes.reduce((min, node) => {
        return node.frequency < min.frequency ? node : min;
    }, nodes[0]);
}

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeGraph(data) {
    syntaxNetworkContainer.innerHTML = ''; // Limpiar el contenedor de red sintáctica
    
    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntaxTreemap(data.syntax, syntaxNetworkContainer);
    }
}

/**
 * Procesa el texto ingresado.
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data);
        
        if (data.syntax && data.syntax.nodes) {
            // Visualiza la sintaxis del texto en la página web
            visualizeSyntaxTreemap(data.syntax, syntaxNetworkContainer);
        } else {  
            console.error("Error: No se encontraron datos de análisis sintáctico válidos en la respuesta del servidor.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para visualizar el análisis sintáctico utilizando un treemap
function visualizeSyntaxTreemap(nodes) {
    clearContainer(syntaxNetworkContainer); // Limpiar el contenedor antes de la visualización

    const hierarchyData = buildHierarchy(nodes);

    const width = 960;
    const height = 600;

    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font", "10px sans-serif");

    const treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1);

    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap(root);

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
        .attr("fill", d => getColorByPOS(d.parent.data.name))
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    leaf.append("text")
        .selectAll("tspan")
        .data(d => [d.data.name.split(' ')[0], `[${d.value}]`])
        .enter().append("tspan")
        .attr("x", 3)
        .attr("y", (d, i) => 13 + i * 10)
        .text(d => d);

    function buildHierarchy(nodes) {
        let root = {name: "root", children: []};
        nodes.forEach(node => {
            let sequence = node.type;
            let size = node.frequency;
            let parts = sequence.split(".");
            let currentNode = root;
            for (let i = 0; i < parts.length; i++) {
                let children = currentNode["children"];
                let nodeName = parts[i];
                let childNode;
                if (i + 1 < parts.length) {
                 // Not yet at the end of the sequence; move down the tree.
                  let foundChild = false;
                  for (let j = 0; j < children.length; j++) {
                    if (children[j]["name"] == nodeName) {
                      childNode = children[j];
                      foundChild = true;
                      break;
                    }
                  }
                  // If we don't already have a child node for this branch, create it.
                  if (!foundChild) {
                    childNode = {"name": nodeName, "children": []};
                    children.push(childNode);
                  }
                  currentNode = childNode;
                } else {
                  // Reached the end of the sequence; create a leaf node.
                  childNode = {"name": nodeName, "value": size};
                  children.push(childNode);
                }
            }
        });
        return root;
    }
}

// Función para asignar colores a las categorías gramaticales
function getColorByPOS(pos) {
    const colorMap = {
        'adp': '#1f77b4',
        'det': '#ff7f0e',
        'adj': '#2ca02c',
        'noun': '#d62728',
        'propn': '#9467bd',
        'pron': '#8c564b',
        'verb': '#e377c2',
        'sconj': '#7f7f7f',
        'adv': '#bcbd22',
        'aux': '#17becf',
        'cconj': '#aec7e8'
    };
    return colorMap[pos] || 'lightblue';
}

// Definir etiquetas completas para las categorías gramaticales en español
const POSLabels = {
    'adp': 'Preposición',
    'conj': 'Conjunción',
    'sconj': 'Conjunción Subordinante',
    'adv': 'Adverbio',
    'det': 'Determinante',
    'noun': 'Sustantivo',
    'verb': 'Verbo',
    'adj': 'Adjetivo',
    'pron': 'Pronombre',
    'propn': 'Nombre Propio',
    'aux': 'Auxiliar',
    'cconj': 'Conjunción Coordinante'
};

// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
