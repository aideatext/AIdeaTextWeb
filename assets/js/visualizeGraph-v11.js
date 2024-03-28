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

    if (!syntaxData || !syntaxData.pos_count) {
    console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
    return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);

    // Recuento de palabras
    const wordCount = syntaxData.nodes.length;
    const mostCommonWord = findMostCommonWord(syntaxData.nodes);
    const leastCommonWord = findLeastCommonWord(syntaxData.nodes);

    // Identificación de tipos de oraciones
    const sentenceTypes = {
        simple: syntaxData.pos_count['SIMPLE'] || 0,
        compound: syntaxData.pos_count['COMPOUND'] || 0,
        subordinate: syntaxData.pos_count['SUBORDINATE'] || 0
    };

    // Crear un elemento para mostrar la información de sintaxis
    const syntaxInfoElement = document.createElement('div');
    syntaxInfoElement.innerHTML = `
        <span>El texto tiene ${wordCount} palabras.</span></br>
        <span>La palabra que más se repite es: "${mostCommonWord.text}".</span></br>
        <span>La palabra que menos se repite es: "${leastCommonWord.text}".</span></br>
        <span>El texto tiene ${wordCount} oraciones. De las cuales:</span></br>
        <span>${sentenceTypes.simple} son oraciones simples.</span></br>
        <span>${sentenceTypes.compound} son oraciones compuestas con 2 o más verbos.</span></br>
        <span>${sentenceTypes.subordinate} son oraciones subordinadas.</span></br>
    `;

    // Mostrar el recuento de palabras por función gramatical
    syntaxInfoElement.innerHTML += "<span>Conteo de palabras por función gramatical:</span></br>";
    Object.entries(syntaxData.pos_count).forEach(([pos, count]) => {
        pos = pos.toLowerCase().replace('_', ' '); // Convertir a minúsculas y reemplazar guiones bajos
        syntaxInfoElement.innerHTML += `<span>[${count}] son ${pos}:</span> ${count > 0 ? 'Sí' : 'No'}</br>`;
    });

    countContainer.appendChild(syntaxInfoElement);
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
