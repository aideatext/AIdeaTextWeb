function processText() {
    var textInput = document.getElementById("text").value;
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
        // Visualiza la sintaxis del texto en la página web
        visualizeGraph(data); // Asegúrate de que esta línea esté presente
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

function visualizeGraph(data) {
    const networkContainer = document.getElementById("network");
    const countContainer = document.getElementById("count-section");
    networkContainer.innerHTML = '';
    countContainer.innerHTML = '';

    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.entities) {
        // Visualización del Análisis Semántico (Grafo)
        visualizeSemantic(data.entities, data.cra, networkContainer);
    }
}

function visualizeSyntax(syntaxData, countContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    countContainer.innerHTML = '';

    // Recuento de palabras
    const wordCount = syntaxData.nodes.length;
    const mostCommonWord = findMostCommonWord(syntaxData.nodes);
    const leastCommonWord = findLeastCommonWord(syntaxData.nodes);

    // Crear un elemento para mostrar el recuento de palabras
    const wordCountElement = document.createElement('p');
    wordCountElement.textContent = `El texto tiene ${wordCount} palabras. La palabra más común es "${mostCommonWord.text}" y la menos común es "${leastCommonWord.text}".`;
    countContainer.appendChild(wordCountElement);

    // Identificación de tipos de oraciones
    const sentenceTypes = identifySentenceTypes(syntaxData);
    const sentenceTypesElement = document.createElement('p');
    sentenceTypesElement.textContent = `Oraciones compuestas con 2 o más verbos: ${sentenceTypes.compound}, Oraciones simples: ${sentenceTypes.simple}, Oraciones subordinadas: ${sentenceTypes.subordinate}`;
    countContainer.appendChild(sentenceTypesElement);
}

function findMostCommonWord(nodes) {
    let mostCommon = nodes[0];
    nodes.forEach(node => {
        if (node.frequency > mostCommon.frequency) {
            mostCommon = node;
        }
    });
    return mostCommon;
}

function findLeastCommonWord(nodes) {
    let leastCommon = nodes[0];
    nodes.forEach(node => {
        if (node.frequency < leastCommon.frequency) {
            leastCommon = node;
        }
    });
    return leastCommon;
}

function identifySentenceTypes(syntaxData) {
    let compoundCount = 0;
    let simpleCount = 0;
    let subordinateCount = 0;

    // Recorrer los bordes para identificar el tipo de oraciones
    syntaxData.edges.forEach(edge => {
        if (edge.relation === "noun_verb") {
            // Contar las oraciones compuestas con 2 o más verbos
            compoundCount++;
        } else if (edge.relation === "nouns_sequence") {
            // Contar las oraciones simples
            simpleCount++;
        } else {
            // Contar las oraciones subordinadas
            subordinateCount++;
        }
    });

    return { compound: compoundCount, simple: simpleCount, subordinate: subordinateCount };
}

function visualizeSemantic(entities, craData, networkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    networkContainer.innerHTML = '';

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
    networkContainer.innerHTML = '';

    // Configuración del contenedor SVG
    const width = 1200;
    const height = 800;
    const svg = d3.select(networkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);

    // Escalador para asignar tamaños proporcionales a los nodos basados en su importancia
    const scaleNodeSize = d3.scaleLinear()
        .domain([0, d3.max(craData.nodes.map(node => node.weight))])
        .range([5, 30]); // Tamaño del nodo entre 5 y 30 píxeles

    // Creamos los nodos y los enlaces basados en los datos del CRA
    const nodes = craData.nodes.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));
    const links = craData.edges.map(edge => ({ source: edge.source, target: edge.target }));

    // Creamos la simulación de fuerzas
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Dibujamos los enlaces
    const link = svg.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

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
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", d => d.x + 10)
            .attr("y", d => d.y);
    });
}
