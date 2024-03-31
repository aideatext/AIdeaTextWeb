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
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeGraph(data) {
    semanticNetworkContainer.innerHTML = ''; // Limpiar el contenedor de red semántica

    if (data.semantic_analysis && data.semantic_analysis.nodes && data.semantic_analysis.edges) {
        // Visualización del Análisis Semántico (Grafo)
        visualizeSemantic(data.semantic_analysis, semanticNetworkContainer);
    }
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
        
        if (data.syntax && data.syntax.nodes) {
            // Visualiza la sintaxis del texto en la página web
            visualizeSyntaxTreemap(data.syntax, syntaxNetworkContainer);
        } else {  
            console.error("Error: No se encontraron datos de análisis sintáctico válidos en la respuesta del servidor.");
        }

        if (data.semantic_analysis && data.semantic_analysis.nodes && data.semantic_analysis.edges) {
            // Visualiza el análisis semántico en la página web
            visualizeSemantic(data.semantic_analysis, semanticNetworkContainer);
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

/**
 * Visualiza el análisis semántico.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(semanticData, container) {
    // Limpiar el contenedor antes de mostrar el grafo
    container.innerHTML = '';

    // Verificar si hay datos válidos de análisis semántico
    if (!semanticData || !semanticData.nodes || !semanticData.edges) {
        console.error("Error: No se encontraron datos de análisis semántico válidos.");
        return;
    }

    const semanticNodes = semanticData.nodes;
    const semanticEdges = semanticData.edges;

    // Declarar la variable simulation antes de su uso
    // Definir la simulación de fuerza
    const simulation = d3.forceSimulation(semanticNodes)
        .force("link", d3.forceLink(semanticEdges).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    // Crear un SVG para dibujar el grafo
    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // Añadir un grupo principal al SVG
    const g = svg.append("g")
        .attr("class", "graph");

    // Definir el enlace de datos para los bordes
    const links = semanticEdges.map(d => ({
        source: d.source.toString(),
        target: d.target.toString(),
        relation: d.relation
    }));

    // Crear un objeto de conjunto para los nodos
    const nodeSet = new Set(semanticNodes.map(d => d.id));

    // Filtrar los enlaces que tienen ambos extremos en el conjunto de nodos
    const filteredLinks = links.filter(link => nodeSet.has(link.source) && nodeSet.has(link.target));

    // Definir la función de enlace
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(filteredLinks)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

    // Definir la función de nodo
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(semanticNodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#1f77b4")
        .call(drag(simulation));

    // Añadir etiquetas de texto a los nodos
    node.append("title")
        .text(d => d.text);

    // Añadir texto a los nodos
    const text = g.append("g")
        .attr("class", "texts")
        .selectAll("text")
        .data(semanticNodes)
        .join("text")
        .text(d => d.text)
        .attr("font-size", "10px")
        .attr("fill", "#000")
        .attr("dy", "0.35em");

    // Definir la función ticked para actualizar las posiciones de los elementos en cada iteración
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", d => d.x + 7)
            .attr("y", d => d.y);
    }

    // Definir la función de arrastre para los nodos
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Añadir el SVG al contenedor
    container.appendChild(svg.node());
}

// Llamar a la función semanticProcess al cargar la página
semanticProcess();
