	function processText() {
	  var textInput = document.getElementById("text").value; // Obtén el texto ingresado por el usuario
	  fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	    },
	    body: JSON.stringify({ text: textInput }), // Envía el texto como el cuerpo de la solicitud
	  })
	  .then(response => response.json()) // Transforma la respuesta en JSON
	  .then(data => {
	    console.log(data);
	    document.getElementById("network").innerText = JSON.stringify(data, null, 2); // Muestra la respuesta JSON formateada
	  })
	  .catch(error => console.error('Error al llamar a la API:', error));
	}
/////////////////////////////////////////////////////////////////////////////////////
//Visualizar la sintaxis del texto en un grafo en el div id "network" <script src="https://d3js.org/d3.v6.min.js"></script>
function visualizeSintax(data) {
    var nodes = data.nodes;
    var edges = data.edges;

    var container = document.getElementById("network");
    container.innerHTML = "";

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    var svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(edges)
        .enter().append("line")
        .attr("stroke-width", 1);

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "steelblue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(d => d.id);}
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
