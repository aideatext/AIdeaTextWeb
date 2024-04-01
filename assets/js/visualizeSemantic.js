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
        
        if (data.semantic_analysis && data.semantic_analysis.nodes && data.semantic_analysis.edges) {
            // Visualiza el análisis semántico en la página web
            visualizeSemantic(data.semantic_analysis, semanticNetworkContainer);
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

///////////////////////////////////////////////////////////////////////
/**
 * Visualiza el análisis semántico.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(semanticData, container) {
    // Limpiar el contenedor antes de mostrar el grafo
    container.innerHTML = '';

    // Verificar si hay datos válidos de análisis semántico
    if (!semanticData || !semanticData.semantic || !semanticData.semantic.nodes || !semanticData.semantic.edges) {
        console.error("Error: No se encontraron datos de análisis semántico válidos.");
        return;
    }

    const nodes = semanticData.semantic.nodes;
    const edges = semanticData.semantic.edges;

    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = container.clientWidth - margin.left - margin.right,
        height = container.clientHeight - margin.top - margin.bottom;

    // append the svg object to the container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

    // Initialize the links
    const link = svg.selectAll("line")
        .data(edges)
        .enter().append("line")
        .style("stroke", "#aaa");

    // Initialize the nodes
    const node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 20)
        .style("fill", "#69b3a2");

    // Let's list the force we wanna apply on the network
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink()
            .id(function(d) { return d.id; })
            .links(edges)
        )
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function (d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}
///////////////////////////////////////////////////////////////////////
// Llamar a la función semanticProcess al cargar la página
semanticProcess();
