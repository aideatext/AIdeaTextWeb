// Contenedor para la visualización del análisis morfológico
const generalInfoContainer = document.getElementById("morphAnalizeUp");
const categoryInfoContainer = document.getElementById("morphAnalizeCenter");

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
 * Cuenta el número de palabras
 * @param {Array} words - El array de palabras.
 * @returns {string} - La palabra más común.
 */
function countWords(text) {
    // Divide el texto en palabras basándose en espacios y otros caracteres no alfabéticos.
    return text.trim().split(/\s+|[,.;:!?()]/).filter(word => word.length > 0).length;
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
    categoryInfoContainer.innerHTML = ''; // Limpiar el contenedor de red sintáctica
    
    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntaxTreemap(data.syntax, categoryInfoContainer);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Procesa el texto ingresado.
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function morphProcess() {
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
        
        // Asumiendo que data contiene un campo 'nodes' para los nodos analizados
        if (data.nodes && data.nodes.length > 0) {
            const totalWords = countWords(textInput);
            clearContainer(generalInfoContainer);
            const wordCountInfo = document.createElement('p');
            wordCountInfo.textContent = `Total de palabras: ${totalWords}`;
            generalInfoContainer.appendChild(wordCountInfo);
            
            const mostCommonNode = findMostCommonWord(data.nodes);
            const leastCommonNode = findLeastCommonWord(data.nodes);
            
            const info = document.createElement('p');
            info.innerHTML = `
                <strong>Total de palabras:</strong> ${totalWords}<br>
                <strong>Palabra más común:</strong> ${mostCommonNode.text} (Frecuencia: ${mostCommonNode.frequency})<br>
                <strong>Palabra menos común:</strong> ${leastCommonNode.text} (Frecuencia: ${leastCommonNode.frequency})
            `;
            generalInfoContainer.appendChild(info);
        }

        if (data.syntax && data.syntax.nodes) {
            // Visualiza la sintaxis del texto en la página web
            visualizeSyntaxTreemap(data.syntax, categoryInfoContainer);
        } else {  
            console.error("Error: No se encontraron datos de análisis sintáctico válidos en la respuesta del servidor.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function visualizeSyntaxTreemap(syntaxData) {
    clearContainer(categoryInfoContainer);

    if (!syntaxData || !syntaxData.nodes) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    const hierarchyData = buildHierarchy(syntaxData.nodes);
    const width = 800, height = 540;
    const svg = d3.select(categoryInfoContainer).append("svg")
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
morphProcess();
