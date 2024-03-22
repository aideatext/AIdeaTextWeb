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
/////////////////////////////////////////////////////////////////////////////////////
//Visualizar la sintaxis del texto en un grafo en el div id "network" <script src="src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js""></script>

function visualizeGraph(data) {
    // Asegúrate de que este elemento exista en tu HTML
    const networkContainer = document.getElementById("network");
    networkContainer.innerHTML = ''; // Limpia el contenedor antes de añadir un nuevo SVG

    const width = 1200;
    const height = 800;
    
    const svg = d3.select(networkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);

    // Función para asignar colores
    const getColor = (type) => {
        switch(type) {
            case "VERB": return "#ff0000"; // Rojo para verbos
            case "NOUN": return "#00ff00"; // Verde para sustantivos
            case "ADJ": return "#0000ff"; // Azul para adjetivos
            default: return "#cccccc"; // Gris para otros tipos
        }
    };

    console.log(nodes);

    const zoomHandler = d3.zoom()
        .on("zoom", (event) => {
            svg.attr("transform", event.transform);
        });    
        svg.call(zoomHandler);
    
    // Usar 'nodes' y 'edges' de 'data' para crear nodos y enlaces
    const nodes = data.nodes.map(d => ({...d, color: getColor(d.type)}));
    const links = data.edges;

    // Simulación de fuerzas para posicionar nodos y enlaces
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Dibujar enlaces
    const link = svg.append("g")
        .attr("stroke", "#999")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 2);

    // Dibujar nodos
    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes) // Asegúrate de que 'nodes' ya tiene la propiedad 'color' asignada
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d => d.color) // Usa la propiedad 'color' para el llenado
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Etiquetas de texto para los nodos
    const text = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.text)
        .attr("x", 8)
        .attr("y", "0.31em");

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

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
