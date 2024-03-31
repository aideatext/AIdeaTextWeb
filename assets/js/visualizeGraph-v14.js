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
 * Procesa el texto ingresado.
 */

function processText() {
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
        visualizeGraph(data.syntax, data.entities, data.cra); // Asegúrate de que esta línea esté presente
      } else {  
        console.error("Error: No se encontraron datos de análisis sintáctico válidos en la respuesta del servidor.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeGraph(data) {
    const syntaxNetworkContainer = document.getElementById("syntax-network");
    const semanticNetworkContainer = document.getElementById("semantic-network");
    syntaxNetworkContainer.innerHTML = '';
    semanticNetworkContainer.innerHTML = '';

    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntaxTreemap(data.syntax, syntaxNetworkContainer);
    }

    if (data.entities) {
        // Visualización del Análisis Semántico (Grafo)
        visualizeSemantic(data.entities, data.cra, semanticNetworkContainer);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////
function visualizeSyntaxTreemap(syntaxData, syntaxNetworkContainer) {
    syntaxNetworkContainer.innerHTML = '';

    if (!syntaxData || !syntaxData.nodes) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    const filteredWords = syntaxData.nodes.filter(node => node.type !== 'PUNCT' && node.type !== 'NUM');

    const wordsByPOS = {};

    filteredWords.forEach(node => {
        if (wordsByPOS[node.type]) {
            wordsByPOS[node.type].push(node.text);
        } else {
            wordsByPOS[node.type] = [node.text];
        }
    });

    const POSLabels = {
        adp: 'preposición',
        conj: 'conjunción',
        sconj: 'conjunción subordinante',
        adv: 'adverbio',
        det: 'determinante',
        noun: 'sustantivo',
        verb: 'verbo',
        adj: 'adjetivo',
        pron: 'pronombre',
        propn: 'nombre propio'
    };

    const width = 1200;
    const height = 600;

    const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(2);

    const treemapData = {
        name: 'syntax',
        children: []
    };

    // Ordenar las categorías gramaticales por número de ocurrencias (de mayor a menor)
    const sortedCategories = Object.keys(wordsByPOS).sort((a, b) => wordsByPOS[b].length - wordsByPOS[a].length);

    // Iterar sobre las categorías gramaticales ordenadas
    sortedCategories.forEach(pos => {
        const words = wordsByPOS[pos];
        const wordCount = words.length;

        const categoryLabel = POSLabels[pos] || pos;
        const categoryNode = {
            name: categoryLabel,
            children: words.map(word => ({ name: word, value: 1 })) // Each word is treated as a separate child node
        };

        treemapData.children.push(categoryNode);
    });

    const root = d3.hierarchy(treemapData)
        .sum(d => d.value);

    treemapLayout(root);

    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", d => getColorByPOS(d.parent.data.name)) // Use parent category color
        .style("opacity", d => 0.6 + 0.4 * (d.value / (d.parent.value))); // Adjust opacity based on word count within category

    svg.selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 20)
        .text(d => d.data.name) // Display word
        .attr("font-size", "14px")
        .attr("fill", "white");

    svg.selectAll("titles")
        .data(root.descendants().filter(d => d.depth === 1))
        .enter()
        .append("text")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 + 21)
        .text(d => `${d.data.name} [${d.value}]`) // Display category name and total count
        .attr("font-size", "14px")
        .attr("fill", d => getColorByPOS(d.data.name));

    svg.append("text")
        .attr("x", 0)
        .attr("y", 14)
        .text("Análisis Sintáctico")
        .attr("font-size", "14px")
        .attr("fill", "grey");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para análisis semántico en visualize.js
/**
 * Visualiza el análisis semántico.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} semanticNetworkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(semanticData, semanticNetworkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    semanticNetworkContainer.innerHTML = '';

    // Transformamos los datos del análisis semántico en una estructura adecuada para visualizeCRA
    const craData = transformSemanticData(semanticData);

    // Visualizamos los resultados del análisis CRA
    visualizeCRA(craData, semanticNetworkContainer);
}

function transformSemanticData(semanticData) {
    const nodes = semanticData.nodes.map(node => ({
        id: node.id,
        text: node.text, // Se incluye el texto del nodo
        lemma: node.lemma, // Se incluye el lemma del nodo
        weight: calculateNodeWeight(node), // Calcula un peso para el nodo
    }));

    const edges = semanticData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        relation: edge.relation
    }));

    return { nodes, edges };
}

function calculateNodeWeight(node) {
    // Aquí podrías calcular el peso del nodo basado en algún criterio relevante,
    // como la frecuencia de la palabra o su importancia en el texto.
    // Por ejemplo, podrías usar la frecuencia de la palabra del análisis sintáctico.
    // Aquí se debe devolver un valor numérico que represente el peso del nodo.
    // Por simplicidad, podríamos devolver 1 para todos los nodos.
    return 1;
}

const semanticNetworkContainer = document.getElementById('semanticNetworkContainer');
visualizeSemantic(semanticData, semanticNetworkContainer);
