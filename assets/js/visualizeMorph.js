// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
document.addEventListener("DOMContentLoaded", function() {
    
    const syntaxNetworkContainer = document.getElementById("syntax-network");
    const syntaxButton = document.getElementById('syntaxButton');

    function clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        } else {
            console.error("El contenedor no existe en el DOM.");
        }
    }
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

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaText_Comprehend', {
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
    clearContainer(syntaxNetworkContainer);

    if (!syntaxData || !syntaxData.nodes) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    const hierarchyData = buildHierarchy(syntaxData.nodes);
    const width = 800, height = 540;
    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font", "12px sans-serif");

    const treemap = d3.treemap().size([width, height]).paddingInner(1).paddingOuter(3); // Ajuste de padding para separación interna
    const root = d3.hierarchy(hierarchyData).sum(d => d.value).sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const leaf = svg.selectAll("g").data(root.leaves()).enter().append("g").attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
        .attr("id", d => d.data.id)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => getColorByFrequency(d.data.value, d.parent.data.name))
        .attr("stroke", "black"); // Añadir borde a cada rectángulo

    leaf.append("text")
        .attr("x", 5)
        .attr("y", 20)
        .text(d => d.data.name + " [" + d.data.value + "]")
        .attr("fill", "white") // Asegurar que el texto sea blanco
        .attr("font-weight", "bold"); // Añadir negrita al texto

    // Títulos de categorías gramaticales
    svg.selectAll(".category-title")
        .data(root.descendants().filter(d => d.depth === 1))
        .enter().append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 15)
        .text(d => `${POSLabels[d.data.name] || d.data.name} [${d.value}]`)
        .attr("font-weight", "bold")
        .attr("fill", "white"); // Asegurar que el título de la categoría sea blanco y en negrita
}
////////////////////////////////////////////////////////////////////////////////////////////////////
   function getColorByFrequency(value, pos) {
        const baseColor = d3.color(getColorByPOS(pos));
        // Ajusta este rango según las frecuencias de tu dataset
        const intensity = d3.scaleLinear().domain([1, 10]).range([1, 0.5])(value);
        return baseColor.darker(intensity);
    }
////////////////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para asignar colores a las categorías gramaticales
function getColorByPOS(pos) {
    const colorMap = {
        'ADP': '#ff6d6d',    //rojo
        'DET': '#ff8686',    //rojo 
        'CONJ': '#ffa0a0',     //rojo  
        'CCONJ': '#ffb9b9',  // rojo
        'SCONJ': '#ffd3d3',  // rojo
        'ADJ': '#ffd3d3', // amarillo
        'ADV': '#cccc00', // amarillo
        'NOUN': '#006700', // verde
        'VERB': '#008000',     // verde
        'PROPN': '#009a00',     // verde
        'PRON': '#00b300',     // verde
        'AUX': '#00cd00'     // verde
    };
    return colorMap[pos] || 'lightblue';
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Definir etiquetas completas para las categorías gramaticales en español
const POSLabels = {
    'ADP': 'Preposición',
    'DET': 'Determinante',
    'CONJ': 'Conjunción',
    'CCONJ': 'Conjunción Coordinante',
    'SCONJ': 'Conjunción Subordinante',
    'ADJ': 'Adjetivo',
    'ADV': 'Adverbio',
    'NOUN': 'Sustantivo',
    'VERB': 'Verbo',
    'PRON': 'Pronombre',
    'PROPN': 'Nombre Propio',
    'AUX': 'Auxiliar'
    
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
