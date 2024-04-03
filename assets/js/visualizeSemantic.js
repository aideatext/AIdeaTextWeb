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
            type: dep.type, // Asegúrate de que esta propiedad exista en tus datos
        })),
        links: dependencies.map(dep => ({
            source: dependencies.findIndex(d => d.text === dep.text),
            target: dependencies.findIndex(d => d.text === dep.head),
        })).filter(link => link.source !== -1 && link.target !== -1) // Filtramos enlaces inválidos
    };

// Dimensiones del SVG
    const width = 1280;
    const height = 720;
    const margin = {top: 20, right: 30, bottom: 30, left: 40}; // Margen para la leyenda

    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Dibujar los enlaces
    const links = svg.selectAll("line")
    .data(data.links)
    .enter().append("line")
    .style("stroke", "#aaa");

    // Dibujar los nodos
    const nodes = svg.selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .style("fill", d => getColorByPOS(d.type)); // Asignar color basado en la categoría gramatical

    // Dibujar etiquetas
    const labels = svg.selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .text(d => d.text)
        .style("font-size", "12px")
        .attr("dx", 8)
        .attr("dy", ".35em")
        .attr("fill", "black"); // Asegúrate de que el color de texto contraste con los colores de nodos

    // Aplicar la simulación de fuerzas
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
    // Dibujar leyenda
    drawLegend(svg, width, height);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para añadir una leyenda al SVG
function drawLegend(svg, width, height) {
    const categories = Object.keys(POSLabels);
    const colorScale = d3.scaleOrdinal(categories, Object.values(colorMap));

    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return POSLabels[d]; });
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para asignar colores a las categorías gramaticales

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

function getColorByPOS(pos) {
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

//////////////////////////////////////////////////////////////////////////////////
semanticProcess();
