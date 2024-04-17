// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
document.addEventListener("DOMContentLoaded", function() {
    const syntaxNetworkContainer = document.getElementById("syntax-network");
    const syntaxButton = document.getElementById('syntaxButton');
    const translations = {
    "nsubj": "sujeto",
    "det": "determinante",
    "ROOT": "raíz",
    // Añade más traducciones según sea necesario
};
    
    function applyTranslations(html) {
    Object.keys(translations).forEach(key => {
        const regex = new RegExp(`>${key}<`, 'g');  // Crear una expresión regular para encontrar el texto
        html = html.replace(regex, `>${translations[key]}<`);
    });
    return html;
    }

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
            if (html && html.startsWith('<!DOCTYPE html>')) {
                // html = applyTranslations(html);  Traducir antes de mostrar
                clearContainer(syntaxNetworkContainer);
                syntaxNetworkContainer.innerHTML = html;
            } else {
                console.error("No se recibieron datos válidos del servidor.");
            }
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error);
        });
    }

    // Event listener para el botón
    syntaxButton.addEventListener('click', syntaxProcess);
});
