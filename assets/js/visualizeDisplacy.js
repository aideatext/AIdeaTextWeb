// Contenedor para la red sintáctica
const syntaxNetworkContainer = document.getElementById("syntax-network");

function clearContainer(container) {
    container.innerHTML = '';
}

function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.text())
    .then(html => {
        console.log("HTML recibido del backend:", html);
        visualizeSyntax(html);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}

function visualizeSyntax(html) {
    clearContainer(syntaxNetworkContainer);
    if (html) {
        syntaxNetworkContainer.innerHTML = html;
    } else {
        console.error("No se recibieron datos válidos del servidor.");
    }
}

syntaxProcess();
