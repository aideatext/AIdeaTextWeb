// Contenedor para la red morfológica
const morphologyContainer = document.getElementById("syntax-network");

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Visualiza los datos de análisis morfológico recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeMorphology(data) {
    clearContainer(morphologyContainer); // Limpiar el contenedor antes de agregar nuevo contenido

    if (!data || !data.morphology) {
        console.error("No morphology data received.");
        return;
    }

    // Crea un elemento de tipo 'div' para mostrar los resultados
    const resultsDiv = document.createElement('div');

    // Visualización del análisis morfológico
    const morphologyTitle = document.createElement('h3');
    morphologyTitle.textContent = 'Análisis Morfológico:';
    resultsDiv.appendChild(morphologyTitle);

    const morphologyList = document.createElement('ul');
    data.morphology.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.text}: ${JSON.stringify(item.features)}`;
        morphologyList.appendChild(listItem);
    });
    resultsDiv.appendChild(morphologyList);

    // Añade el 'div' de resultados al contenedor principal
    morphologyContainer.appendChild(resultsDiv);
}

/**
 * Procesa el texto ingresado para análisis y visualización.
 */
function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaText_Comprehend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data);
        visualizeMorphology(data);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}

// Asegurarse de que syntaxProcess se llama cuando se carga la ventana ms43
window.onload = function() {
    // Añadir el evento click al botón para procesar el análisis cuando se hace clic
    document.getElementById("syntaxButton").addEventListener("click", syntaxProcess);
};
