// Contenedor para la red sintáctica
const syntaxNetworkContainer = document.getElementById("syntax-network");

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Procesa el texto ingresado para análisis sintáctico.
 */
function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.text()) // Cambiado de response.json() a response.text()
    .then(html => {
        console.log("HTML recibido del backend:", html);
        visualizeSyntax(html);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}

/**
 * Visualiza el HTML de Displacy recibido del backend.
 * @param {string} html - HTML del análisis sintáctico generado por Displacy.
 */
function visualizeSyntax(html) {
    clearContainer(syntaxNetworkContainer);
    if (html) {
        // Insertar directamente el HTML en el contenedor
        syntaxNetworkContainer.innerHTML = html;
    } else {
        console.error("No se recibieron datos válidos del servidor.");
    }
}

// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
