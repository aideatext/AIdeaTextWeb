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
            // visualizeSemantic(data.semantic_analysis, semanticNetworkContainer);
             visualizeGraph(data);
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
// Función para visualizar el grafo semántico con vis.js

function visualizeSemantic(semanticData, container) {
    // Limpiar el contenedor antes de mostrar el grafo
    clearContainer(container);

    // Verificar si hay datos válidos de análisis semántico
    if (!semanticData || !semanticData.nodes || !semanticData.edges) {
        console.error("Error: No se encontraron datos de análisis semántico válidos.");
        return;
    }

    //Definir semancticData como un objeto con nodos y enlaces
    semanticData = {
        nodes: semanticData.nodes,
        edges: semanticData.edges
    };
    console.log(semanticData);
    console.log(semanticData.nodes);
    console.log(semanticData.edges);
    console.log(semanticData.nodes.length);
    console.log(semanticData.edges.length);
    console.log(semanticData.nodes[0].id);
    console.log(semanticData.nodes[0].text);
    console.log(semanticData.edges[0].source);
    console.log(semanticData.edges[0].target);
    console.log(semanticData.edges[0].relation);

    console.log(semanticData.nodes[0].id.toString());
    console.log(semanticData.nodes[0].text);
    console.log(semanticData.edges[0].source.toString());
    console.log(semanticData.edges[0].target.toString());
    console.log(semanticData.edges[0].relation);

    // Crear una nueva red utilizando vis.js
    const data = {
        nodes: semanticData.nodes,
        edges: semanticData.edges
    };
    const options = {
        nodes: {
            shape: 'box',
            font: {
                size: 20,
                color: 'white'
            }
        },
        edges: {
            arrows: 'to',
            font: {
                align: 'middle'
            }
        },
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed'
            }
        },
        physics: {
            enabled: false
        }
    };
    const network = new vis.Network(container, data, options);
    console.log(network);
    console.log(network.nodes);
    console.log(network.edges);
    console.log(network.nodes.length);
    console.log(network.edges.length);
    console.log(network.nodes[0].id);
    console.log(network.nodes[0].text);
    console.log(network.edges[0].source);
    console.log(network.edges[0].target);
    console.log(network.edges[0].relation);
    console.log(network.nodes[0].id.toString());
    console.log(network.nodes[0].text);
    console.log(network.edges[0].source.toString());
    console.log(network.edges[0].target.toString());
    console.log(network.edges[0].relation);
}
///////////////////////////////////////////////////////////////////////

// Llamar a la función para visualizar el grafo semántico
visualizeSemantic(semanticData, semanticNetworkContainer);

///////////////////////////////////////////////////////////////////////
// Llamar a la función semanticProcess al cargar la página
semanticProcess();
