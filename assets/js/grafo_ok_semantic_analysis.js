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
    const textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend para análisis semántico:", data);
        if (data.semantic && data.semantic.entities) {
            visualizeSemantic(data.semantic, semanticNetworkContainer);
        } else {
            console.error("Error: No se encontraron datos de análisis semántico válidos en la respuesta del servidor.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto para el análisis semántico:", error);
    });
}

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
*/
function visualizeSemantic(semanticData, container) {
    clearContainer(container);
    if (semanticData.dependencies) {
        visualizeDependencies(semanticData.dependencies, container);
    }
}

/**
 * Nueva función de visualización de dependencias
function visualizeDependencies(dependencies, container) {
    container.innerHTML = '';
    const svg = d3.select(container).append("svg")
        .attr("width", "100%")
        .attr("height", 600)
        .style("font", "10px sans-serif");

    dependencies.forEach((dep, index) => {
        svg.append("text")
            .attr("x", 10)
            .attr("y", 20 + index * 20)
            .text(`${dep.text} (${dep.dep} de ${dep.head})`);
    });
}
 */


/**
 * Nueva función de visualización de dependencias
*/
function visualizeDependencies(dependencies, container) {
const data = {
    nodes: dependencies.map((dep, index) => ({
        id: index,
        text: dep.text,
    })),
    links: dependencies.map(dep => ({
        source: dependencies.findIndex(d => d.text === dep.text),
        target: dependencies.findIndex(d => d.text === dep.head),
    })).filter(link => link.source !== -1 && link.target !== -1) // Filtramos enlaces inválidos
};
    //Definir espacio de visualización
    const width = 1280;
    const height = 720;
    const svg = d3.select("#semantic-network").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Dibujar los enlaces
    const links = svg.selectAll("line")
    .data(data.links)
    .enter().append("line")
    .style("stroke", "#aaa");

    //Dibujar los nodos
    const nodes = svg.selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .style("fill", "blue");

    const labels = svg.selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .text(d => d.text)
        .style("font-size", "12px")
        .attr("dx", 8)
        .attr("dy", ".35em");

    //Aplicar la simulación de fuerzas
    const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", () => {
        links.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodes.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels.attr("x", d => d.x)
              .attr("y", d => d.y);
    });   
}

semanticProcess();
