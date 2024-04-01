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

    // Configurar el tamaño del treemap
    const width = 800;
    const height = 600;

    // Crear el layout del treemap
    const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(2);

    // Crear un conjunto de datos para el treemap
    const treemapData = {
        name: 'syntax',
        children: []
    };

    // Iterar sobre las categorías gramaticales y sus palabras asociadas
    for (const pos in wordsByPOS) {
        const words = wordsByPOS[pos];
        const wordCount = words.length;

        // Agregar la etiqueta completa de la categoría gramatical
        const categoryLabel = POSLabels[pos] || pos;
        const categoryNode = {
            name: categoryLabel,
            children: []
        };

        // Agregar cada palabra y su frecuencia de aparición
        words.forEach(word => {
            categoryNode.children.push({
                name: `${word} [${wordCount}]`,
                value: wordCount // Usar el número de repeticiones como valor
            });
        });
         // Agregar el nodo de categoría gramatical al conjunto de datos del treemap
        treemapData.children.push(categoryNode);
    }

    // Convertir los datos en una jerarquía de d3
    const root = d3.hierarchy(treemapData)
        .sum(d => d.value);

    // Calcular la posición y tamaño de cada rectángulo en el treemap
    treemapLayout(root);

    // Crear el contenedor SVG para el treemap
    const svg = d3.select(syntaxNetworkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);

    // Prepare a color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(POSLabels))
        .range(['#402D54', '#D18975', '#8FD175', '#AEC7E8', '#BCBD22', '#8C564B', '#2CA02C', '#D62728', '#9467BD', '#FF7F0E', '#1F77B4']);

    // And an opacity scale
    const opacity = d3.scaleLinear()
        .domain([1, 10]) // Adjust as needed
        .range([0.5, 1]);

    // Use this information to add rectangles:
    svg.selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", d => color(d.data.name))
        .style("opacity", d => opacity(d.data.value / d.data.name.split(' ').length));

    // And to add the text labels
    svg.selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 20)
        .text(d => d.data.name.split(' ')[0]) // Extracting only the word
        .attr("font-size", "19px")
        .attr("fill", "white");

    // And to add the text labels for counts
    svg.selectAll("vals")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 35)
        .text(d => `[${d.data.value}]`)
        .attr("font-size", "11px")
        .attr("fill", "white");

    // Add title for the 3 groups
    svg.selectAll("titles")
        .data(root.descendants().filter(d => d.depth === 1))
        .enter()
        .append("text")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 + 21)
        .text(d => d.data.name)
        .attr("font-size", "19px")
        .attr("fill", d => color(d.data.name));

    // Add title for the treemap
    svg.append("text")
        .attr("x", 0)
        .attr("y", 14)
        .text("Análisis Sintáctico")
        .attr("font-size", "19px")
        .attr("fill", "grey");
}

// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
