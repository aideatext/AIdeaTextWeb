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

    // Creamos una lista ordenada para mostrar las palabras más empleadas
    const wordList = document.createElement('ol');

    // Recorremos los nodos del análisis sintáctico
    syntaxData.nodes.forEach(node => {
        // Creamos un elemento de lista para cada palabra
        const listItem = document.createElement('li');
        listItem.textContent = `${node.text} (${node.type})`; // Mostramos la palabra y su tipo gramatical
        wordList.appendChild(listItem);
    });

    // Agregamos la lista al contenedor
    countContainer.appendChild(wordList);
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

    // Podemos también mostrar los resultados del CRA, por ejemplo:
    // Aquí puedes implementar la lógica para mostrar los resultados del CRA en el networkContainer
    // Por ejemplo, podrías mostrar las palabras más empleadas y sus relaciones
    // Recuerda que esto dependerá de cómo estructures los datos de salida del CRA en el backend
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
}
