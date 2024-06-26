// Contenedor para la red semántica
const semanticNetworkContainer = document.getElementById("semantic-network");

/**
 * Obtiene un elemento del DOM por su ID.
 * @param {string} id - El ID del elemento.
 * @returns {HTMLElement} - El elemento del DOM.
 */
function getContainerElement(id) {
    return document.getElementById(id);
}

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Procesa el texto ingresado para análisis semántico.
 */
function semanticProcess() {
    var textInput = document.getElementById("text-1").value;
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
        console.log("Datos recibidos del backend para análisis semántico:", data);

        // Asegúrate de que data.semantic y sus subcampos esperados existan
        if (data.semantic && data.semantic.entities && data.semantic.cra){
            // Si existe, visualiza el análisis semántico en la página web
            visualizeSemantic(data.semantic, semanticNetworkContainer);
        } else {  
            // Si no, muestra un mensaje de error en la consola y opcionalmente en la interfaz de usuario
            console.error("Error: No se encontraron datos de análisis semántico válidos en la respuesta del servidor.");
            // Aquí puedes agregar una alerta en la interfaz de usuario o alguna otra forma de mostrar el error al usuario
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto para el análisis semántico:", error)
    });
}


/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} container - El contenedor para mostrar la red semántica.
 */
function visualizeSemantic(semanticData, semanticNetworkContainer) {
    // Limpiar el contenedor antes de mostrar los resultados
    semanticNetworkContainer.innerHTML = '';

    // La comprobación anterior a la visualización estaba redundante,
    // ya que semanticData ya es el objeto que contiene a entities y cra directamente.
    if (semanticData && semanticData.entities) {
        // Visualizar el análisis semántico de las entidades
        visualizeSemanticEntities(semanticData.entities, semanticNetworkContainer);

        // Ahora esta comprobación es correcta, ya que estamos accediendo directamente a semanticData.cra
        if (semanticData.cra) {
            visualizeCRA(semanticData.cra, semanticNetworkContainer);
        }
    } else {  
        console.error("Error: No se encontraron datos de análisis semántico válidos en la respuesta del servidor.");
    }
}

/**
 * Visualiza el análisis semántico utilizando una lista de entidades.
 * @param {Object} semanticData - Los datos de análisis semántico.
 * @param {HTMLElement} semanticNetworkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeSemanticEntities(semanticData, semanticNetworkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    semanticNetworkContainer.innerHTML = '';

    // Verificar si semanticData.entities está definido
    if (semanticData && semanticData.entities) {
        // Creamos un elemento de lista para mostrar las entidades nombradas
        const entityList = document.createElement('ul');

        // Recorremos las entidades encontradas en el análisis semántico
        semanticData.entities.forEach(entity => {
            // Creamos un elemento de lista para cada entidad
            const listItem = document.createElement('li');
            listItem.textContent = entity;
            entityList.appendChild(listItem);
        });

        // Agregamos la lista al contenedor
        semanticNetworkContainer.appendChild(entityList);
    } else {
        // Si no hay datos de entidades, mostramos un mensaje de error
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'No se encontraron entidades en los datos de análisis semántico.';
        semanticNetworkContainer.appendChild(errorMessage);
    }
}

/**
 * Visualiza el análisis CRA.
 * @param {Array} craData - Los datos de análisis CRA.
 * @param {HTMLElement} semanticNetworkContainer - El contenedor para mostrar la red semántica.
 */
function visualizeCRA(craData, semanticNetworkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    semanticNetworkContainer.innerHTML = '';

    // Configuración del contenedor SVG
    const width = 1200;
    const height = 800;
    const svg = d3.select(semanticNetworkContainer).append("svg")
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

// Llamar a la función syntaxProcess al cargar la página
semanticProcess();
