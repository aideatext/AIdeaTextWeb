// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
document.addEventListener("DOMContentLoaded", function() {
    
    const syntaxNetworkContainer = document.getElementById("syntax-network");
    const syntaxButton = document.getElementById('syntaxButton');

    function clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        } else {
            console.error("El contenedor no existe en el DOM.");
        }
    }

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}
    
    function syntaxProcess() {
        const textInput = document.getElementById("text-1").value;
        if (!textInput.trim()) {
            console.error("El texto para analizar no puede estar vacío.");
            return;
        }

        fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput })
        })
        .then(response => response.text())
        .then(html => {
            if (html.trim().startsWith('<div')) {
                clearContainer(syntaxNetworkContainer);
                syntaxNetworkContainer.innerHTML = html;
                console.log("Displacy output has been inserted into the container.");
            } else {
                console.error("No se recibieron datos válidos del servidor:", html);
            }
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error);
        });
    }

    if (syntaxButton) {
        syntaxButton.addEventListener('click', syntaxProcess);
    } else {
        console.error("El botón de análisis sintáctico no se encuentra en el DOM.");
    }
});
