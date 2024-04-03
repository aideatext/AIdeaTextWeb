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
            //visualizeSemantic(data.semantic, semanticNetworkContainer);
            visualizeEntities(semanticData.entities, container);
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
function visualizeEntities(semanticData.entities, container) {
    clearContainer(container);
    if (semanticData.dependencies) {
        visualizeEntities(semanticData.entities, container);
    }
}


/**
 * Nueva función de visualización de entidades
*/
function visualizeSemantic(semanticData, container) {
    clearContainer(container);

    // Asumiendo que semanticData.entities contiene las entidades
    if (semanticData.entities) {
        visualizeEntities(semanticData.entities, container);
    }
}

function visualizeEntities(entities, container) {
    const svg = d3.select(container).append("svg")
        .attr("width", "100%")
        .attr("height", 600)
        .style("font", "10px sans-serif");

    // Crea los nodos para cada entidad
    const nodes = entities.map((entity, index) => ({
        id: index,
        text: entity,
        group: 1 // O categoriza las entidades si tienes esa información
    }));

    // Asignar posición inicial a los nodos para visualización
    nodes.forEach((node, index) => {
        node.x = Math.random() * 800; // Posición aleatoria, ajusta según necesidad
        node.y = Math.random() * 600;
    });

    // Dibujar los nodos
    svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5) // Radio del círculo
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("fill", d => getColorByPOS('NOUN')); // Ejemplo, asignando color, ajusta según necesidad

    // Dibujar etiquetas para las entidades
    svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", d => d.x + 8)
        .attr("y", d => d.y + 3)
        .text(d => d.text)
        .style("font-size", "12px")
        .attr("fill", "black");
}

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
//////////////////////////////////////////////////////////////////////////////////
semanticProcess();
