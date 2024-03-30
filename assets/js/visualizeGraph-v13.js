/**
 * Llama a la API para procesar el texto.
 * @param {string} textInput - El texto a procesar.
 * @returns {Promise<Object>} - Una promesa que resuelve con los datos procesados.
 */
async function callComprehendAPI(textInput) {
    //const response = await fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            LanguageCode: 'es',
            Text: textInput
        })
    });
    
    if (!response.ok) {
        throw new Error(`Error al llamar a la API de Comprehend: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Procesa el texto ingresado.
 */
async function processText() {
    const textInput = document.getElementById("text").value.trim();
    if (!textInput) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    try {
        const data = await callComprehendAPI(textInput);
        visualizeSyntax(data.SyntaxTokens);
    } catch (error) {
        console.error("Error al procesar el texto:", error);
    }
}


// Ajusta la función visualizeData para mostrar los resultados de Comprehend
function visualizeData(data) {
    const countContainer = getContainerElement("count-section");
    clearContainer(countContainer);

    if (data.syntax) {
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.comprehend) {
        // Aquí debes mostrar los resultados de Comprehend en el frontend
        // Puedes agregar funciones específicas para mostrar entidades, frases clave, etc.
        // Ejemplo: visualizeEntities(data.comprehend.entities, countContainer);
        // Ejemplo: visualizeKeyPhrases(data.comprehend.keyPhrases, countContainer);
    }
}

/**
 * Visualiza el análisis sintáctico proporcionado por Amazon Comprehend.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información.
 */
function visualizeSyntax(syntaxData, countContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    countContainer.innerHTML = '';

    if (!syntaxData || !syntaxData.pos_count) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);

    if (!syntaxData.nodes) {
        console.error("Error: No se encontraron nodos de análisis sintáctico.");
        return;
    }

    // Recuento de palabras
    const wordCount = syntaxData.nodes.length;

    // Verificar si syntaxData.pos_count está definido correctamente
    if (!syntaxData.pos_count || typeof syntaxData.pos_count !== 'object') {
        console.error("Error: El conteo de palabras por función gramatical no está definido correctamente.");
        return;
    }

    // Conteo de palabras por función gramatical
    const wordCountByPOS = syntaxData.pos_count;

    // Verificar si wordCountByPOS está definido correctamente
    if (!wordCountByPOS || typeof wordCountByPOS !== 'object') {
        console.error("Error: El conteo de palabras por función gramatical no está definido correctamente.");
        return;
    }

    // Palabras por categoría gramatical
    const POSLabels = {
        det: 'determinante',
        noun: 'sustantivo',
        verb: 'verbo',
        adj: 'adjetivo',
        adv: 'adverbio',
        adp: 'preposición',
        conj: 'conjunción',
        num: 'número',
        pron: 'pronombre',
        propn: 'nombre propio',
        punct: 'puntuación',
        sconj: 'conjunción subordinante'
    };

    // Palabra más común
    const mostCommonWord = findMostCommonWord(syntaxData.nodes);

    // Verificar si mostCommonWord está definido correctamente
    if (!mostCommonWord || typeof mostCommonWord !== 'object') {
        console.error("Error: La palabra más común no está definida correctamente.");
        return;
    }

    // Palabra menos común
    const leastCommonWord = findLeastCommonWord(syntaxData.nodes);

    // Verificar si leastCommonWord está definido correctamente
    if (!leastCommonWord || typeof leastCommonWord !== 'object') {
        console.error("Error: La palabra menos común no está definida correctamente.");
        return;
    }

        // Obtener el conteo de oraciones
    const sentenceCount = syntaxData.sentence_count;
    
    // Identificación de tipos de oraciones
    const sentenceTypes = {
        simple: syntaxData.pos_count['SIMPLE'] || 0,
        compound: syntaxData.pos_count['COMPOUND'] || 0,
        subordinate: syntaxData.pos_count['SUBORDINATE'] || 0
    };

 // Crear un elemento para mostrar la información de sintaxis
    const syntaxInfoElement = document.createElement('div');
    syntaxInfoElement.innerHTML = `
        <span>El texto tiene ${wordCount} palabras.</span><br>
        <span>La palabra que más se repite es: "${mostCommonWord.text}".</span><br>
        <span>La palabra que menos se repite es: "${leastCommonWord.text}".</span><br>
        <span>Conteo de palabras por función gramatical:</span><br>
    `;
    
    // Mostrar el recuento de palabras por función gramatical
    Object.entries(wordCountByPOS).forEach(([pos, count]) => {
        pos = pos.toLowerCase().replace('_', ' ');
        syntaxInfoElement.innerHTML += `<span>[${count}] son ${pos}</span><br>`;
    });

    // Verificar si pos_words está presente en syntaxData
    if (syntaxData.pos_words) {
        // Mostrar las diez primeras palabras por cada categoría gramatical
        Object.entries(syntaxData.pos_words).forEach(([pos, words]) => {
            syntaxInfoElement.innerHTML += `<span>Las diez primeras palabras de la categoría gramatical "${pos}": ${words.slice(0, 10).join(', ')}</span><br>`;
        });
    }

    // Mostrar información sobre oraciones
    syntaxInfoElement.innerHTML += `
        <span>El texto tiene ${sentenceCount} oraciones. De las cuales:</span><br>
        <span>${sentenceTypes.simple} son oraciones simples.</span><br>
        <span>${sentenceTypes.compound} son oraciones compuestas con 2 o más verbos.</span><br>
        <span>${sentenceTypes.subordinate} son oraciones subordinadas.</span><br>
    `;
    
    countContainer.appendChild(syntaxInfoElement);
}

    
/**
 * Visualiza el análisis semántico proporcionado por Amazon Comprehend.
 * @param {Object} syntaxData - Los datos de análisis semántico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información.
 */

function visualizeSemantic(entities, craData, networkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    networkContainer.innerHTML = ''; // Corregido de network-1Container a networkContainer

    // Creamos un elemento de lista para mostrar las entidades nombradas
    const entityList = document.createElement('ul');

    // Recorremos las entidades encontradas en el análisis semántico
    entities.forEach(entity => {
        // Creamos un elemento de lista para cada entidad
        const listItem = document.createElement('li');
        listItem.textContent = entity;
        entityList.appendChild(listItem);
    });

    // Agregamos la lista al contenedor
    networkContainer.appendChild(entityList);

    // Visualizamos los resultados del CRA
    visualizeCRA(craData, networkContainer);
}

function visualizeCRA(craData, networkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    networkContainer.innerHTML = ''; // Corregido de network-1Container a networkContainer

    // Configuración del contenedor SVG
    const width = 1200;
    const height = 800;
    const svg = d3.select(networkContainer).append("svg") // Corregido de network-1Container a networkContainer
        .attr("width", width)
        .attr("height", height);

    // Escalador para asignar tamaños proporcionales a los nodos basados en su importancia
    const scaleNodeSize = d3.scaleLinear()
        .domain([0, d3.max(craData.map(node => node.weight))])
        .range([5, 30]); // Tamaño del nodo entre 5 y 30 píxeles

    // Creamos los nodos y los enlaces basados en los datos del CRA
    const nodes = craData.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));

    // Creamos la simulación de fuerzas
    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Dibujamos los nodos
    const node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.size)
        .attr("fill", "#66ccff"); // Color azul para los nodos

    // Etiquetas de texto para los nodos
    const text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("x", 8)
        .attr("y", "0.31em");

    // Actualizamos la posición de los elementos en cada paso de la simulación
    simulation.on("tick", () => {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        text
            .attr("x", d => d.x + 10)
            .attr("y", d => d.y);
    });
}


