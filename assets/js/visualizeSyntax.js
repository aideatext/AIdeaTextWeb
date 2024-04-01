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

//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Visualiza el análisis sintáctico utilizando un treemap.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} syntaxNetworkContainer - El contenedor para mostrar el treemap.
 */
function visualizeSyntaxTreemap(syntaxData, syntaxNetworkContainer) {
    // Limpiar el contenedor antes de mostrar los resultados
    syntaxNetworkContainer.innerHTML = '';

    // Verificar si hay datos válidos de análisis sintáctico
    if (!syntaxData || !syntaxData.nodes) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    // Filtrar palabras, excluyendo signos de puntuación y números
    const filteredWords = syntaxData.nodes.filter(node => node.type !== 'PUNCT' && node.type !== 'NUM');

    // Agrupar palabras por categoría gramatical y calcular proporciones
    const wordsByPOS = {};

    // Iterar sobre las palabras filtradas y agruparlas por categoría gramatical
    filteredWords.forEach(node => {
        if (wordsByPOS[node.type]) {
            wordsByPOS[node.type].push(node.text);
        } else {
            wordsByPOS[node.type] = [node.text];
        }
    });

// Suponiendo que tienes acceso a D3 y has definido variables como 'diameter' y 'margin'
const diameter = 600; // Esto establece el diámetro total de la visualización a 600 píxeles.
const margin = 20;   // Esto establece un margen de 20 píxeles alrededor de los círculos.

// Definir etiquetas completas para las categorías gramaticales en español
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
    
// Función de visualización que utiliza POSLabels
function visualizeSyntaxCirclePacking(syntaxData) {
    // Procesamiento de datos aquí, utilizando POSLabels para mapear códigos a nombres completos
    // Ejemplo: 
    syntaxData.nodes.forEach(node => {
        node.label = POSLabels[node.type] || node.type; // Asigna etiquetas en español
    });


// Preparar el contenedor SVG
const diameter = 600; // Diámetro del círculo principal
const margin = 20; // Margen alrededor del círculo
const svg = d3.select("#semantic-network").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

// Definir el esquema de colores para las categorías gramaticales
const color = d3.scaleOrdinal()
    .domain(['adp', 'conj', 'sconj', 'adv', 'det', 'noun', 'verb', 'adj', 'pron', 'propn'])
    .range(['#402D54', '#D18975', '#8FD175', '#AEC7E8', '#BCBD22', '#8C564B', '#2CA02C', '#D62728', '#9467BD', '#FF7F0E', '#1F77B4']);

// Función para construir la jerarquía de datos a partir de los nodos de análisis sintáctico
function buildHierarchy(nodes) {
    let categories = {};
    nodes.forEach(node => {
        if (!categories[node.type]) {
            categories[node.type] = { name: node.type, children: [] };
        }
        let wordExists = categories[node.type].children.find(child => child.name === node.text);
        if (wordExists) {
            wordExists.value += 1;
        } else {
            categories[node.type].children.push({ name: node.text, value: 1 });
        }
    });

    let hierarchy = { name: "root", children: [] };
    for (let key in categories) {
        hierarchy.children.push(categories[key]);
    }
    return hierarchy;
}

// Función para visualizar el análisis sintáctico usando Circle Packing
function visualizeSyntaxCirclePacking(syntaxData) {
    const hierarchyData = buildHierarchy(syntaxData.nodes); // Asume que 'syntaxData.nodes' es tu array de nodos
    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    root.sum(d => d.value); // Recalcular los valores para el packing
    pack(root);

    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("r", d => d.r)
        .style("fill", d => color(d.data.name));

    node.append("text")
        .selectAll("tspan")
        .data(d => d.children ? [d.data.name] : [d.data.name, d.data.value])
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => 13 + (i - nodes.length / 2 - 0.5) * 10)
        .text(d => d)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .style("text-anchor", "middle");
}
/////////////////////////////////////////////////////////////////////////////////////
// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
