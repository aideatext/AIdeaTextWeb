// Referencias a los contenedores
const generalInfoContainer = document.getElementById("morphAnalize-1");
const categoryInfoContainer = document.getElementById("morphAnalize-2");

function clearContainers() {
    generalInfoContainer.innerHTML = '';
    categoryInfoContainer.innerHTML = '';
}

function visualizeMorphology(data) {
    clearContainers();

    if (!data || !data.morphology) {
        console.error("No morphology data received or data is malformed.");
        return;
    }

    // Resumen general en una sola línea
    const generalInfo = document.createElement('p');
    generalInfo.textContent = `[1] Resumen General: Cantidad Total de Palabras: ${data.totalWords} || ` +
        `Palabra más común: ${data.mostCommonWord} [${data.mostCommonWordCount}] || ` +
        `Palabra menos común: ${data.leastCommonWord} [${data.leastCommonWordCount}]`;
    generalInfoContainer.appendChild(generalInfo);

    // Distribución por categorías gramaticales
    const posDistribution = document.createElement('h3');
    posDistribution.textContent = '[2] Distribución de la cantidad de palabras por cada una de las categorías gramaticales';
    categoryInfoContainer.appendChild(posDistribution);

    Object.entries(data.posCount).forEach(([pos, details]) => {
        const categoryElement = document.createElement('p');
        categoryElement.textContent = `${pos} [${details.count}]: ` + 
            Object.entries(details.words).map(([word, count]) => `${word} [${count}]`).join('; ');
        categoryInfoContainer.appendChild(categoryElement);
    });
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
