function getContainerElement(id) {
    return document.getElementById(id);
}

function findMostCommonWord(nodes) {
    return nodes.reduce((max, node) => {
      return node.frequency > max.frequency ? node : max;
    }, nodes[0]);
}

function findLeastCommonWord(nodes) {
    return nodes.reduce((min, node) => {
      return node.frequency < min.frequency ? node : min;  
    }, nodes[0]);
}

function processText() {
    const textInput = document.getElementById("text").value.trim();
    if (!textInput) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
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
        visualizeGraph(data);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

function visualizeGraph(data) {
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

    const syntaxInfoElement = getSyntaxElement(wordCount, mostCommonWord, leastCommonWord, sentenceTypes, syntaxData.pos_count);
    countContainer.appendChild(syntaxInfoElement);
}

function visualizeSemantic(entities, craData, networkContainer) {
    clearContainer(networkContainer);

    const entityList = document.createElement('ul');

    entities.forEach(entity => {
        const listItem = document.createElement('li');
        listItem.textContent = entity;
        entityList.appendChild(listItem);
    });

    networkContainer.appendChild(entityList);
    
    // Agregar console.log para inspeccionar craData
    console.log("Datos de CRA:", craData);

    // Verificar si craData es un array antes de llamar a visualizeCRA
    if (!Array.isArray(craData)) {
        console.error("craData debe ser un array");
        return;
    }

    visualizeCRA(craData, networkContainer);
}

function visualizeGraph(data) {
    const networkContainer = getContainerElement("network");
    const countContainer = getContainerElement("count-section");
    clearContainer(networkContainer);
    clearContainer(countContainer);

    if (data.syntax) {
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.entities) {
        console.log(data.cra); // Agregar esta línea para imprimir los datos de cra en la consola
        visualizeSemantic(data.entities, data.cra, networkContainer);
    }
}

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
