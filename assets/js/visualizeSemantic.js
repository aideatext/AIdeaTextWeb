// Contenedor para la red semántica
const semanticNetworkContainer = document.getElementById("semantic-network");

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
 * Procesa el texto ingresado para análisis semántico.
 */
function semanticProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data);

        if (data.semantic && data.semantic_analysis.nodes && data.semantic_analysis.edges) {
            // Visualiza el análisis semántico en la página web
            visualizeSemanticGraph(data.semantic, semanticNetworkContainer);
        } else {  
            console.error("Error: No se encontraron datos de análisis semántico válidos en la respuesta del servidor.");
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
    const semanticNetworkContainer = document.getElementById("semantic-network");
    semanticNetworkContainer.innerHTML = '';

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

///////////////////////////////////////////////////////////////////////
/**
 * Visualiza el análisis semántico utilizando un grafo
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
 */
// Función para visualizar el grafo semántico d3.js}
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
// Llamar a la función syntaxProcess al cargar la página
semanticProcess();

