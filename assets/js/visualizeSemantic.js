// Contenedor para la red semántica
const semanticNetworkContainer = document.getElementById("semantic-network");

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
function visualizeSemantic(data, container) {
    clearContainer(container); // Limpiar el contenedor de red semántica

    if (!data || !data.nodes || !data.edges) {
        console.error("Error: No se encontraron datos válidos de análisis semántico.");
        return;
    }

    // Crear una nueva red utilizando vis.js
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
}

///////////////////////////////////////////////////////////////////////

// Llamar a la función semanticProcess al cargar la página
semanticProcess();
