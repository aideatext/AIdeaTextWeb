// Añade esta función para llamar a la API de Comprehend desde el frontend
async function callComprehendAPI(textInput) {
    try {
        const response = await fetch('URL_DEL_BACKEND', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: textInput }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al llamar a la API de Comprehend:', error);
        throw error;
    }
}

// Modifica la función processText para que llame a la nueva función de la API de Comprehend
async function processText() {
    const textInput = document.getElementById("text").value.trim();
    if (!textInput) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    try {
        const data = await callComprehendAPI(textInput);
        visualizeData(data);
    } catch (error) {
        console.error("Error al procesar el texto:", error);
    }
}

// Ajusta la función visualizeData para mostrar los resultados de Comprehend
function visualizeData(data) {
    const countContainer = getContainerElement("count-section");
    clearContainer(countContainer);

    if (data.syntax) {
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.comprehend) {
        // Aquí debes mostrar los resultados de Comprehend en el frontend
        // Puedes agregar funciones específicas para mostrar entidades, frases clave, etc.
        // Ejemplo: visualizeEntities(data.comprehend.entities, countContainer);
        // Ejemplo: visualizeKeyPhrases(data.comprehend.keyPhrases, countContainer);
    }
}
