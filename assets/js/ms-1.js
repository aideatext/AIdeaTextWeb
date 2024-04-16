// Referencias a los contenedores
const generalInfoContainer = document.getElementById("morphAnalize-1");
const categoryInfoContainer = document.getElementById("morphAnalize-2");

function clearContainers() {
    generalInfoContainer.innerHTML = '';
    categoryInfoContainer.innerHTML = '';
}

function visualizeMorphology(data) {
    clearContainers();

    if (!data) {
        console.error("No data received or data is malformed.");
        return;
    }

    // Resumen general en una sola línea
    const generalInfo = document.createElement('p');
    generalInfo.textContent = `[1] Resumen General: Cantidad Total de Palabras: ${data.totalWords || 0} || ` +
        `Palabra más común: ${data.mostCommonWord || 'N/A'} [${data.mostCommonWordCount || 0}] || ` +
        `Palabra menos común: ${data.leastCommonWord || 'N/A'} [${data.leastCommonWordCount || 0}]`;
    generalInfoContainer.appendChild(generalInfo);

    // Distribución por categorías gramaticales
    const posDistribution = document.createElement('h3');
    posDistribution.textContent = '[2] Distribución de la cantidad de palabras por cada una de las categorías gramaticales';
    categoryInfoContainer.appendChild(posDistribution);

    if (data.posCount && Object.keys(data.posCount).length > 0) {
        Object.entries(data.posCount).forEach(([pos, details]) => {
            if (details && details.words) {
                const categoryElement = document.createElement('p');
                categoryElement.textContent = `${pos} [${details.count || 0}]: ` + 
                    Object.entries(details.words).map(([word, count]) => `${word} [${count}]`).join('; ');
                categoryInfoContainer.appendChild(categoryElement);
            }
        });
    } else {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = "No hay datos disponibles para categorías gramaticales.";
        categoryInfoContainer.appendChild(noDataMsg);
    }
}

function morphProcess() {
    const textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaText_Comprehend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
    })
    .then(response => response.json())
    .then(data => {
        visualizeMorphology(data);
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}

window.onload = function() {
    document.getElementById("morphButton").addEventListener("click", morphProcess);
};
