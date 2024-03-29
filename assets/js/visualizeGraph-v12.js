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
 * Obtiene un elemento HTML para mostrar información sobre el análisis sintáctico.
 * @param {number} wordCount - El número de palabras en el texto.
 * @param {Object} mostCommonWord - La palabra más común.
 * @param {Object} leastCommonWord - La palabra menos común.
 * @param {Object} sentenceTypes - Tipos de oraciones encontradas.
 * @param {Object} posCount - Conteo de partes del discurso.
 * @returns {HTMLElement} - El elemento HTML creado.
 */
function getSyntaxElement(wordCount, mostCommonWord, leastCommonWord, sentenceTypes, posCount) {
    const syntaxElement = document.createElement('div');

    syntaxElement.innerHTML = `
        <h2>Análisis Sintáctico</h2>
        <p>Número de palabras: ${wordCount}</p>
        <p>Palabra más común: ${mostCommonWord}</p>
        <p>Palabra menos común: ${leastCommonWord}</p>
        <p>Tipo de oraciones:</p>
        <ul>
            <li>Simple: ${sentenceTypes.simple}</li>
            <li>Compuesta: ${sentenceTypes.compound}</li>
            <li>Subordinada: ${sentenceTypes.subordinate}</li>
        </ul>
        <p>Conteo de partes del discurso:</p>
        <pre>${JSON.stringify(posCount, null, 2)}</pre>
    `;

    return syntaxElement;
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
    const textInput = document.getElementById("text").value.trim();
    if (!textInput) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    // Realiza la llamada a la API para procesar el texto
    callAPI(textInput)
        .then(data => {
            console.log("Datos recibidos del backend:", data);
            visualizeData(data);
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error)
        });
}

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeData(data) {
    const networkContainer = getContainerElement("network");
    const countContainer = getContainerElement("count-section");
    clearContainer(networkContainer);
    clearContainer(countContainer);

    if (data.syntax) {
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.entities) {
        visualizeSemantic(data.entities, data.cra, networkContainer);
        console.log(data.cra); // Agregar esta línea para imprimir los datos de cra en la consola
    }
}

/**
 * Visualiza el análisis sintáctico.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información.
 */
/**
 * Visualiza el análisis sintáctico.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información de sintaxis.
 */

function visualizeSyntax(syntaxData, countContainer) {
    clearContainer(countContainer);

    if (!syntaxData || !syntaxData.pos_count) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);

    const wordCount = syntaxData.nodes.length;
    const mostCommonWord = findMostCommonWord(syntaxData.nodes);
    const leastCommonWord = findLeastCommonWord(syntaxData.nodes);

    const sentenceTypes = {
        simple: syntaxData.pos_count['SIMPLE'] || 0,
        compound: syntaxData.pos_count['COMPOUND'] || 0,
        subordinate: syntaxData.pos_count['SUBORDINATE'] || 0
    };

    // Aquí se llama a la función getSyntaxElement para obtener el elemento HTML con la información sintáctica
    const syntaxInfoElement = getSyntaxElement(wordCount, mostCommonWord, leastCommonWord, sentenceTypes, syntaxData.pos_count);
    countContainer.appendChild(syntaxInfoElement);
}

/**
 * Visualiza el análisis semántico.
 * @param {Array} entities - Las entidades detectadas en el texto.
 * @param {Object} craData - Los datos de análisis CRA.
 * @param {HTMLElement} networkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(entities, craData, networkContainer) {
    clearContainer(networkContainer);

    const entityList = document.createElement('ul');

    entities.forEach(entity => {
        const listItem = document.createElement('li');
        listItem.textContent = entity;
        entityList.appendChild(listItem);
    });

    networkContainer.appendChild(entityList);

    console.log("Datos de CRA:", craData);

    if (!Array.isArray(craData)) {
        console.error("craData debe ser un array");
        return;
    }

    visualizeCRA(craData, networkContainer);
}

/**
 * Visualiza el análisis CRA.
 * @param {Array} craData - Los datos de análisis CRA.
 * @param {HTMLElement} networkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeCRA(craData, networkContainer) {
    clearContainer(networkContainer);

    const width = 1200;
    const height = 800;
    const svg = d3.select(networkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);

    const scaleNodeSize = d3.scaleLinear()
        .domain([0, d3.max(craData.map(node => node.weight))])
        .range([5, 30]);

    const nodes = craData.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    const node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.size)
        .attr("fill", "#66ccff");

    const text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("x", 8)
        .attr("y", "0.31em");

    simulation.on("tick", () => {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        text
            .attr("x", d => d.x + 10)
            .attr("y", d => d.y);
    });
}

/**
 * Llama a la API para procesar el texto.
 * @param {string} textInput - El texto a procesar.
 * @returns {Promise<Object>} - Una promesa que resuelve con los datos procesados.
 */
function callAPI(textInput) {
    return fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json());
}

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}
