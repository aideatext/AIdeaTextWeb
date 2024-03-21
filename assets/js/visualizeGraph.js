function processText() {
    var textInput = document.getElementById("text").value;
    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data); // Imprime los datos en la consola
        visualizeGraph(data); // Llama a una nueva función para visualizar el grafo
    })
    .catch(error => console.error('Error al llamar a la API:', error));
}

function visualizeGraph(data) {
    d3.select("#network").html(""); // Limpia el contenedor antes de añadir un nuevo SVG
    const width = 1200;
    const height = 800;
    
    const svg = d3.select("#network").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Crear los nodos
    const nodes = data.nodes.map(d => ({...d, id: d.id}));
    
    // Crear los enlaces
    const links = data.edges.map(d => ({source: d.source, target: d.target, label: d.relation}));
    
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
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    // Dibujar nodos
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#69b3a2")
        .call(drag(simulation));

    // Etiquetas de texto para los nodos
    const text = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.text)
        .attr("x", 8)
        .attr("y", "0.31em");

    // Actualizar la posición de nodos y enlaces en cada "tick" de la simulación
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
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    // Función de arrastre para nodos
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

