// Añade esta función para llamar a la API de Comprehend desde el frontend
async function callComprehendAPI(textInput) {
    try {
        const response = await fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: textInput }),
        });
        
        if (!response.ok) {
            throw new Error(`Error al llamar a la API de Comprehend: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { syntax: data }; // Envuelve los datos del análisis sintáctico en una propiedad "syntax"
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

/**
 * Visualiza el análisis sintáctico proporcionado por Amazon Comprehend.
 * @param {Object} syntaxData - Los datos de análisis sintáctico.
 * @param {HTMLElement} countContainer - El contenedor para mostrar la información.
 */
function visualizeSyntax(syntaxData, countContainer) {
    clearContainer(countContainer);

    if (!syntaxData || !syntaxData.syntaxTokens) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);
    
    const wordCount = syntaxData.syntaxTokens.length;
    const posCount = {};

    // Contar el número de ocurrencias de cada parte del discurso
    syntaxData.syntaxTokens.forEach(token => {
        const pos = token.partOfSpeech.tag;
        posCount[pos] = posCount[pos] ? posCount[pos] + 1 : 1;
    });

    // Crear un objeto para mapear las abreviaturas de las partes del discurso a nombres legibles
    const posLabels = {
        "ADJ": "Adjetivo",
        "ADP": "Preposición",
        "ADV": "Adverbio",
        "CONJ": "Conjunción",
        "DET": "Determinante",
        "NOUN": "Sustantivo",
        "NUM": "Número",
        "PRON": "Pronombre",
        "PRT": "Partícula",
        "VERB": "Verbo",
        ".": "Puntuación",
        "X": "Otra"
    };

    // Crear elementos HTML para mostrar la información de análisis sintáctico
    const syntaxInfoElement = document.createElement('div');
    syntaxInfoElement.innerHTML = `
        <h2>Análisis Sintáctico</h2>
        <p>Este texto tiene un total de ${wordCount} palabras.</p>
        <p>Conteo de palabras por función gramatical:</p>
    `;

    const posList = document.createElement('ul');
    for (const pos in posCount) {
        const posName = posLabels[pos] || pos;
        const listItem = document.createElement('li');
        listItem.textContent = `${posCount[pos]} ${posName}`;
        posList.appendChild(listItem);
    }
    syntaxInfoElement.appendChild(posList);

    // Mostrar la información en el contenedor
    countContainer.appendChild(syntaxInfoElement);
}
