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
        visualizeSintax(data); // Asegúrate de que esta línea esté presente
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
    }
/////////////////////////////////////////////////////////////////////////////////////
//Visualizar la sintaxis del texto en un grafo en el div id "network" <script src="src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js""></script>
function visualizeSintax(data) {
    var nodes = data.nodes;
    var edges = data.edges;

    var container = document.getElementById("network");
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        layout: {
            improvedLayout: false
        },
        edges: {
            smooth: false
        }
    };
    var network = new vis.Network(container, data, options);
}


document.getElementById("analyze").addEventListener("click", processText);
document.getElementById("text").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        processText();
    }
}
);
