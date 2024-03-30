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
        visualizeGraph(data); // Asegúrate de que esta línea esté presente
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

/**
 * Visualiza el análisis sintáctico utilizando un treemap.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} syntaxNetworkContainer - El contenedor para mostrar el treemap.
 */
// Limpiar el contenedor antes de mostrar los resultados

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

    // Renderizar los rectángulos del treemap
    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "lightblue"); // Color de fondo de los rectángulos

    // Agregar etiquetas de texto a cada cuadrado del treemap
    cell.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => d.data.name) // Mostrar el nombre de la categoría gramatical o palabra
        .attr("fill", "black"); // Color del texto

    // Agregar leyenda horizontal
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(10, ${height - 20})`);

    let legendX = 0;
    for (const pos in POSLabels) {
        const label = POSLabels[pos];
        legend.append("rect")
            .attr("x", legendX)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", getColorByPOS(pos));

        legend.append("text")
            .attr("x", legendX + 15)
            .attr("y", 10)
            .text(label)
            .attr("font-size", "10px");

        legendX += label.length * 6 + 40;
    }
}

// Función para asignar colores a las categorías gramaticales
function getColorByPOS(pos) {
    // Aquí puedes definir tus propios colores para cada categoría gramatical
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
    return colorMap[pos] || '#000000'; // Color negro por defecto
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Visualiza el análisis semántico.
     * @param {Array} entities - Las entidades detectadas en el texto.
     * @param {Object} craData - Los datos de análisis CRA.
     * @param {HTMLElement} semanticNetworkContainer - El contenedor para mostrar la red semántica.
     */
    function visualizeSemantic(entities, craData, semanticNetworkContainer) {
        // Limpiamos el contenedor antes de mostrar los resultados
        semanticNetworkContainer.innerHTML = '';

        // Creamos un elemento de lista para mostrar las entidades nombradas
        const entityList = document.createElement('ul');

        // Recorremos las entidades encontradas en el análisis semántico
        entities.forEach(entity => {
            // Creamos un elemento de lista para cada entidad
            const listItem = document.createElement('li');
            listItem.textContent = entity;
            entityList.appendChild(listItem);
        });

        // Agregamos la lista al contenedor
        semanticNetworkContainer.appendChild(entityList);

        // Visualizamos los resultados del CRA
        visualizeCRA(craData, semanticNetworkContainer);
    }

    /**
     * Visualiza el análisis CRA.
     * @param {Array} craData - Los datos de análisis CRA.
     * @param {HTMLElement} semanticNetworkContainer - El contenedor para mostrar la red semántica.
     */
    function visualizeCRA(craData, semanticNetworkContainer) {
        // Limpiamos el contenedor antes de mostrar los resultados
        semanticNetworkContainer.innerHTML = '';

        // Configuración del contenedor SVG
        const width = 1200;
        const height = 800;
        const svg = d3.select(semanticNetworkContainer).append("svg")
            .attr("width", width)
            .attr("height", height);

        // Escalador para asignar tamaños proporcionales a los nodos basados en su importancia
        const scaleNodeSize = d3.scaleLinear()
            .domain([0, d3.max(craData.map(node => node.weight))])
            .range([5, 30]); // Tamaño del nodo entre 5 y 30 píxeles

        // Creamos los nodos y los enlaces basados en los datos del CRA
        const nodes = craData.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));

        // Creamos la simulación de fuerzas
        const simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Dibujamos los nodos
        const node = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", d => d.size)
            .attr("fill", "#66ccff"); // Color azul para los nodos

        // Etiquetas de texto para los nodos
        const text = svg.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(d => d.id)
            .attr("x", 8)
            .attr("y", "0.31em");

        // Actualizamos la posición de los elementos en cada paso de la simulación
        simulation.on("tick", () => {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            text
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y);
        });
    }
