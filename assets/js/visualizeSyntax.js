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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
function visualizeSyntaxTreemap(syntaxData) {
    syntaxNetworkContainer.innerHTML = ''; // Limpiar el contenedor antes de mostrar los resultados

    if (!syntaxData || !syntaxData.nodes) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    const hierarchyData = buildHierarchy(syntaxData.nodes);

    const width = 960;
    const height = 600;
    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font", "12px sans-serif");

    const treemap = d3.treemap()
        .size([width, height])
        .paddingOuter(3);

    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value) // aquí se define el tamaño de las cajas según el valor
        .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("id", d => d.data.id)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => getColorByPOS(d.parent.data.name)); // Asignar color según categoría gramatical

    cell.append("text")
        .attr("x", 5)
        .attr("y", 20)
        .text(d => d.data.name + " [" + d.data.value + "]"); // Nombre de la palabra y cantidad de repeticiones

    // Título para cada categoría gramatical
    svg.selectAll(".title")
        .data(root.descendants().filter(d => d.depth == 1))
        .enter().append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 15)
        .text(d => d.data.name + " [" + d.value + "]")
        .attr("font-weight", "bold");

    // Función para construir la jerarquía basada en las categorías gramaticales y la frecuencia de las palabras
    function buildHierarchy(nodes) {
        let root = { name: "root", children: [] };
        let categoryMap = {};

        nodes.forEach(node => {
            if (!categoryMap[node.type]) {
                categoryMap[node.type] = { name: node.type, children: [] };
            }
            let child = categoryMap[node.type].children.find(child => child.name === node.text);
            if (child) {
                child.value += 1; // Si la palabra ya existe, incrementar el contador
            } else {
                categoryMap[node.type].children.push({ name: node.text, value: 1 }); // Si no, agregarla nueva
            }
        });

        Object.values(categoryMap).forEach(category => {
            root.children.push(category);
        });

        return root;
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
