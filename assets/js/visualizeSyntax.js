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

//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Visualiza el análisis sintáctico utilizando un treemap.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} syntaxNetworkContainer - El contenedor para mostrar el treemap.
 */
// Visualización del análisis sintáctico utilizando un treemap
function visualizeSyntaxTreemap(syntaxData) {
    syntaxNetworkContainer.innerHTML = ''; // Limpiar el contenedor antes de la visualización

    // Asegurar que tenemos datos válidos
    if (!syntaxData || !syntaxData.nodes) {
        console.error("No se encontraron datos válidos.");
        return;
    }

    // Convertir datos de análisis sintáctico a formato adecuado para D3
    let hierarchyData = buildHierarchy(syntaxData.nodes);

    // Dimensiones del SVG
    const width = 960;
    const height = 600;

    // Crear el contenedor SVG
    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font", "10px sans-serif");

    // Crear el layout de treemap
    const treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1);

    // Construir la jerarquía de datos y sumar los valores
    const root = d3.hierarchy(hierarchyData)
        .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
        .sum(sumBySize)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    // Aplicar el layout de treemap
    treemap(root);

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Añadir los rectángulos
    leaf.append("rect")
        .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("fill", d => getColorByPOS(d.parent.data.name))
        .attr("fill-opacity", 0.6)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    // Añadir los títulos de los rectángulos
    leaf.append("clipPath")
        .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
      .append("use")
        .attr("xlink:href", d => d.leafUid.href);

    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => (d.data.name + " [" + d.value + "]").split(/(?=[A-Z][^A-Z])/g))
        .join("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${i + 1.1}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);

    // Añadir y configurar la etiqueta de cada categoría gramatical
    svg.selectAll("titles")
        .data(root.descendants().filter(d => d.depth === 1))
        .enter().append("text")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 - 6)
        .text(d => `${POSLabels[d.data.name]} [${d.value}]`);

    // Añadir el título principal
    svg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("class", "title")
        .text("Análisis Sintáctico");

    // Función para construir la jerarquía de datos
    function buildHierarchy(nodes) {
        const hierarchy = { name: "root", children: [] };
        const categories = {};

        nodes.forEach(node => {
            if (!categories[node.type]) {
                categories[node.type] = { name: node.type, children: [] };
            }
            categories[node.type].children.push({ name: node.text, value: node.frequency });
        });

        for (const categoryName in categories) {
            hierarchy.children.push(categories[categoryName]);
        }

        return hierarchy;
    }

    // Función para sumar los valores en la jerarquía
    function sumBySize(d) {
        return d.value;
    }
}

// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
