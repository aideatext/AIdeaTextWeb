// graphUtils.js

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
 */
function visualizeGraphData(data, container) {
    container.innerHTML = ''; // Limpiar el contenedor de red semántica

    if (data.semantic_analysis && data.semantic_analysis.nodes && data.semantic_analysis.edges) {
        // Visualización del Análisis Semántico (Grafo)
        visualizeSemantic(data.semantic_analysis, container);
    }
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

    const nodes = semanticData.nodes.map(node => ({ id: node.id }));
    const links = semanticData.edges.map(edge => ({ source: edge.source, target: edge.target }));

    const svg = ForceGraph({ nodes, links }, { width: "100%", height: "100%" });

    // Añadir el SVG al contenedor
    container.appendChild(svg);
}
