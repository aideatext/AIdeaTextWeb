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
        // Procesamiento adicional aquí...
        visualizeGraph(data); // Asegúrate de que esta línea esté presente
    })
    .catch(error => console.error('Error al llamar a la API:', error));
}
/////////////////////////////////////////////////////////////////////////////////////
function visualizeEntitiesAndPhrases(data) {
    const networkContainer = document.getElementById("network");
    networkContainer.innerHTML = '';

    // Considerando que ahora `data` tiene una propiedad `nodes` en lugar de `entities`
    if (data.nodes && data.nodes.length > 0) {
        const entitiesTitle = document.createElement('h3');
        entitiesTitle.textContent = 'Entidades identificadas:';
        networkContainer.appendChild(entitiesTitle);

        const entitiesList = document.createElement('ul');
        data.nodes.forEach(node => {
            const listItem = document.createElement('li');
            listItem.textContent = `${node.text} (${node.type})`;
            entitiesList.appendChild(listItem);
        });
        networkContainer.appendChild(entitiesList);
    }

    // Verifica si data.entities existe y tiene elementos
    if (data.entities && data.entities.length > 0) {
        // El resto del código para visualizar entidades
    }

    // Verifica si data.key_phrases existe y tiene elementos
    if (data.key_phrases && data.key_phrases.length > 0) {
        // El resto del código para visualizar frases clave
    }
}

    // Crea y añade las entidades al contenedor
    if (data.entities.length > 0) {
        const entitiesTitle = document.createElement('h3');
        entitiesTitle.textContent = 'Entidades identificadas:';
        networkContainer.appendChild(entitiesTitle);

        const entitiesList = document.createElement('ul');
        data.entities.forEach(entity => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entity.Text} (${entity.Type})`;
            entitiesList.appendChild(listItem);
        });
        networkContainer.appendChild(entitiesList);
    }

    // Crea y añade las frases clave al contenedor
    if (data.key_phrases.length > 0) {
        const phrasesTitle = document.createElement('h3');
        phrasesTitle.textContent = 'Frases clave identificadas:';
        networkContainer.appendChild(phrasesTitle);

        const phrasesList = document.createElement('ul');
        data.key_phrases.forEach(phrase => {
            const listItem = document.createElement('li');
            listItem.textContent = phrase.Text;
            phrasesList.appendChild(listItem);
        });
        networkContainer.appendChild(phrasesList);
    }
///////////////////////////////////////////////////////////////////////////////////////////////////
function visualizeGraph(data) {
    // Asegúrate de que este elemento exista en tu HTML
    const networkContainer = document.getElementById("network");
    networkContainer.innerHTML = ''; // Limpia el contenedor antes de añadir un nuevo SVG

    const width = 1200;
    const height = 800;
    
    const svg = d3.select(networkContainer).append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Usar 'nodes' y 'edges' de 'data' para crear nodos y enlaces
    const nodes = data.nodes;
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
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "#69b3a2")
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

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
