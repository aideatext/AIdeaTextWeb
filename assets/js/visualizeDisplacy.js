// Contenedor para la red sintáctica
const syntaxNetworkContainer = document.getElementById("syntax-network");

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
    .then(response => {
        console.log(`Response Status: ${response.status}`); // Ver el estado de la respuesta
        return response.text(); // Asumimos texto siempre para evitar problemas con JSON.parse
    })
    .then(html => {
        console.log("HTML recibido del backend:", html.substring(0, 200)); // Mostrar solo los primeros 200 caracteres para diagnóstico
        visualizeSyntax(html);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}

function visualizeSyntax(html) {
    clearContainer(syntaxNetworkContainer);
    if (html && html.startsWith('<!DOCTYPE html>')) {
        syntaxNetworkContainer.innerHTML = html;
        console.log("Displacy output has been inserted into the container.");
    } else {
        console.error("No se recibieron datos válidos del servidor.");
    }
}

syntaxProcess();
