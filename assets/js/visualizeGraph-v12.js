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
function getSyntaxElement(wordCount, posCount) {
    const syntaxElement = document.createElement('div');

    // Construir la lista de palabras por tipo de partes del discurso
    let posList = '';
    for (const pos in posCount) {
        if (pos !== 'word_count') {
            const posName = pos.toLowerCase().replace('_', ' ');
            posList += `<li>${posCount[pos]} ${posName}: ${posCount[pos]}</li>`;
        }
    }

    syntaxElement.innerHTML = `
        <h2>Análisis Sintáctico</h2>
        <p>Este texto tiene un total de ${wordCount} palabras.</p>
        <p>Que se dividen en:</p>
        <ul>
            ${posList}
        </ul>
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
    // const networkContainer = getContainerElement("network");
    const countContainer = getContainerElement("count-section");
    // clearContainer(networkContainer);
    clearContainer(countContainer);

    if (data.syntax) {
        visualizeSyntax(data.syntax, countContainer);
    }

    //if (data.entities) {
    //    visualizeSemantic(data.entities, data.cra, networkContainer);
    //    console.log(data.cra); // Agregar esta línea para imprimir los datos de cra en la consola
    //}
}

/**
 * Visualiza el análisis sintáctico.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información.
 */
function visualizeSyntax(syntaxData, countContainer) {
    clearContainer(countContainer);

    if (!syntaxData || !syntaxData.pos_count) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);
    console.log("Edges:", syntaxData.edges);

    const wordCount = syntaxData.nodes.length;
    const posCount = syntaxData.pos_count;

    // Crear un objeto para almacenar el recuento de palabras por tipo
    const wordTypeCount = {
        'Sustantivo (nombre)': posCount['NOUN'] || 0,
        'Adjetivo': posCount['ADJ'] || 0,
        'Verbo': posCount['VERB'] || 0,
        'Adverbio': posCount['ADV'] || 0,
        'Pronombre': posCount['PRON'] || 0,
        'Preposición': posCount['ADP'] || 0,
        'Conjunción': posCount['CCONJ'] || 0,
        'Interjección': posCount['INTJ'] || 0
    };

    // Crear un objeto para almacenar las oraciones por tipo
    const sentenceTypeCount = {
        'Simple': 0,
        'Compuesta': 0,
        'Subordinada': 0
    };

    // Obtener la lista de oraciones
    const sentences = syntaxData.edges.map(edge => edge.source);

    // Contar el número de oraciones por tipo
    sentences.forEach(sentence => {
        const type = sentence.split(':')[0];
        sentenceTypeCount[type]++;
    });

    // Crear elementos HTML para mostrar la información
    const wordCountElement = document.createElement('p');
    wordCountElement.textContent = `Este texto tiene un total de ${wordCount} palabras`;

    const wordTypeListElement = document.createElement('ul');
    for (const [type, count] of Object.entries(wordTypeCount)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${count} ${type}: [listar los ${type.toLowerCase()}]`;
        wordTypeListElement.appendChild(listItem);
    }

    const sentenceCountElement = document.createElement('p');
    sentenceCountElement.textContent = `Después de oraciones, este texto tiene un total de ${sentences.length} oraciones`;

    const sentenceTypeListElement = document.createElement('ul');
    for (const [type, count] of Object.entries(sentenceTypeCount)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${type}: [listar las ${type.toLowerCase()}]`;
        sentenceTypeListElement.appendChild(listItem);
    }

    // Agregar los elementos al contenedor
    countContainer.appendChild(wordCountElement);
    countContainer.appendChild(wordTypeListElement);
    countContainer.appendChild(sentenceCountElement);
    countContainer.appendChild(sentenceTypeListElement);
}

/**
 * Visualiza el análisis semántico.
 * @param {Array} entities - Las entidades detectadas en el texto.
 * @param {Object} craData - Los datos de análisis CRA.
 * @param {HTMLElement} networkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(entities, craData, networkContainer) {
   // clearContainer(networkContainer);

   // const entityList = document.createElement('ul');

    // entities.forEach(entity => {
    //    const listItem = document.createElement('li');
    //    listItem.textContent = entity;
    //    entityList.appendChild(listItem);
    // });

    // networkContainer.appendChild(entityList);

    // console.log("Datos de CRA:", craData);

    // Se agrega una validación para asegurar que craData sea un array
    //if (!Array.isArray(craData)) {
    //    console.error("craData debe ser un array");
    //    return;
   // }

    // Se verifica si craData está vacío antes de llamar a visualizeCRA
    //if (craData.length === 0) {
    //    console.error("craData no puede estar vacío");
    //    return;
    //}

    //visualizeCRA(craData, networkContainer);
}

/**
 * Visualiza el análisis CRA.
 * @param {Array} craData - Los datos de análisis CRA.
 * @param {HTMLElement} networkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeCRA(craData, networkContainer) {
    //clearContainer(networkContainer);

    //const width = 1200;
    //const height = 800;
    //const svg = d3.select(networkContainer).append("svg")
    //    .attr("width", width)
    //    .attr("height", height);

    //const scaleNodeSize = d3.scaleLinear()
    //    .domain([0, d3.max(craData.map(node => node.weight))])
    //    .range([5, 30]);

    //const nodes = craData.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));

    //const simulation = d3.forceSimulation(nodes)
    //    .force("charge", d3.forceManyBody())
    //    .force("center", d3.forceCenter(width / 2, height / 2));

    //const node = svg.selectAll("circle")
    //    .data(nodes)
    //    .enter().append("circle")
    //    .attr("r", d => d.size)
    //    .attr("fill", "#66ccff");

    //const text = svg.selectAll("text")
    //    .data(nodes)
    //    .enter().append("text")
    //    .text(d => d.id)
    //    .attr("x", 8)
    //    .attr("y", "0.31em");

    //simulation.on("tick", () => {
    //    node
    //        .attr("cx", d => d.x)
    //        .attr("cy", d => d.y);
    //    text
    //        .attr("x", d => d.x + 10)
    //        .attr("y", d => d.y);
    //}); 
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
