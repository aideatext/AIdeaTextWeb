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

function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
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
        if (data.syntax && Array.isArray(data.syntax.nodes)) {
            visualizeSemantic(data.syntax.nodes); // Asumiendo que los datos son los nodos
        } else {
            console.error("Error: Datos no válidos.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}


/**
 * Definir etiquetas en español 
 * @param {Object} POSLabes 
 */
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

function visualizeSemantic(data) {
    // Definir dimensiones y margen
    const width = 928;
    const height = 600;
    const margin = 1;

    // Formato para valores
    const format = d3.format(",d");

    // Escala de colores basada en categorías gramaticales
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Preparar el layout de empaquetamiento
    const pack = d3.pack()
        .size([width - margin * 2, height - margin * 2])
        .padding(3);

    // Calcular la jerarquía y aplicar el layout de empaquetamiento
    const root = pack(d3.hierarchy({children: data})
        .sum(d => d.frequency));

    // Crear contenedor SVG
    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-margin, -margin, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");

    // Posicionar cada nodo
    const node = svg.append("g")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Añadir círculos
    node.append("circle")
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data.type)) // Usar categoría gramatical para color
        .attr("r", d => d.r);

    // Añadir etiquetas de texto
    node.append("text")
        .selectAll("tspan")
        .data(d => [`${d.data.text} [${d.data.frequency}]`, `${POSLabels[d.data.type]}`]) // Mostrar información
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i) => `${i * 1.2}em`)
        .attr("font-size", "12px")
        .attr("fill-opacity", (d, i) => i ? 0.7 : 1)
        .text(d => d);

    return svg.node();
}
/////////////////////////////////////////////////////////////////////////////////////
// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
