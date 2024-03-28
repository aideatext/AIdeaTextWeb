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
/////////////////////////////////////////////////////////////////////////////////////////////////////
function visualizeSyntax(syntaxData, countContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    countContainer.innerHTML = '';

    // Recuento de palabras
    const wordCount = syntaxData.word_count;
    const mostCommonWord = syntaxData.most_common_word;
    const leastCommonWord = syntaxData.least_common_word;

    // Identificación de tipos de oraciones
    const sentenceTypes = {
        simple: syntaxData.sentence_count - (syntaxData.pos_count.match(/\[\d+\]/g).reduce((a, b) => a + parseInt(b.match(/\d+/)[0]), 0) - syntaxData.pos_count.match(/\[\d+\] compound/g).reduce((a, b) => a + parseInt(b.match(/\d+/)[0]), 0)),
        compound: syntaxData.pos_count.match(/\[\d+\] compound/g).reduce((a, b) => a + parseInt(b.match(/\d+/)[0]), 0),
        subordinate: syntaxData.pos_count.match(/\[\d+\] subordinate/g).reduce((a, b) => a + parseInt(b.match(/\d+/)[0]), 0)
    };

    // Crear un elemento para mostrar la información de sintaxis
    const syntaxInfoElement = document.createElement('div');
    syntaxInfoElement.innerHTML = `
        <span>El texto tiene ${wordCount} palabras.</span></br> 
        <span>La palabra que más se repite es: "${mostCommonWord}".</span></br>
        <span>La palabra que menos se repite es: "${leastCommonWord}".</span></br>
        <span>El texto tiene ${syntaxData.sentence_count} oraciones. De las cuales:</span></br>
        <span>${sentenceTypes.simple} son oraciones simples.</span></br>
        <span>${sentenceTypes.compound} son oraciones compuestas con 2 o más verbos.</span></br>
        <span>${sentenceTypes.subordinate} son oraciones subordinadas.</span></br>
    `;
    countContainer.appendChild(syntaxInfoElement);
}

///////////////////////////////////////////////////////////////////////////////
/* function findMostCommonWord(nodes) {
//    let mostCommon = nodes[0];
//    nodes.forEach(node => {
//        if (node.frequency > mostCommon.frequency) {
//            mostCommon = node;
//        }
//    });
//    return mostCommon;
//}
//
//function findLeastCommonWord(nodes) {
//    let leastCommon = nodes[0];
//    nodes.forEach(node => {
//        if (node.frequency < leastCommon.frequency) {
//            leastCommon = node;
//        }
//    });
//    return leastCommon;
}
//
//function identifySentenceTypes(syntaxData) {
//    let compoundCount = 0;
 //   let simpleCount = 0;
 //   let subordinateCount = 0;

    // Recorrer los bordes para identificar el tipo de oraciones//
//    syntaxData.edges.forEach(edge => {
//        if (edge.relation === "noun_verb") {
            // Contar las oraciones compuestas con 2 o más verbos
//            compoundCount++;
//        } else if (edge.relation === "nouns_sequence") {
//            // Contar las oraciones simples
//            simpleCount++;
//        } else {
// Contar las oraciones subordinadas
 //           subordinateCount++;
 //       }
 //   });

//    return { compound: compoundCount, simple: simpleCount, subordinate: subordinateCount };
// } */
//////////////////////////////////////////////////////////////////////////////////////////////////////////
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
