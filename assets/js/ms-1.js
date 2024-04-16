// Contenedor para la red morfológica
const morphologyContainer = document.getElementById("syntax-network");

function clearContainer(container) {
    container.innerHTML = '';
}

function formatFeatures(features) {
    return Object.entries(features).map(([key, value]) => {
        let [featureKey, featureValue] = key.split('=');
        return `${featureKey}: ${featureValue}`;
    }).join(', ');
}

function visualizeMorphology(data) {
    clearContainer(morphologyContainer);

    if (!data || !data.morphology) {
        console.error("No morphology data received or data is malformed.");
        return;
    }

    // Resumen general
    const generalInfo = document.createElement('h3');
    generalInfo.textContent = '[1] Resumen General';
    morphologyContainer.appendChild(generalInfo);

    const totalWords = document.createElement('p');
    totalWords.textContent = `Cantidad Total de Palabras: ${data.totalWords}`;
    morphologyContainer.appendChild(totalWords);

    // Distribución por categorías gramaticales
    const posDistribution = document.createElement('h3');
    posDistribution.textContent = '[2] Distribución de la cantidad de palabras por cada una de las categorías gramaticales';
    morphologyContainer.appendChild(posDistribution);

    if (data.posCount) {
        Object.entries(data.posCount).forEach(([pos, details]) => {
            if (details.words) {
                const categoryElement = document.createElement('p');
                categoryElement.textContent = `${pos} [${details.count}]: ` + 
                    Object.entries(details.words).map(([word, count]) => `${word} [${count}]`).join('; ');
                morphologyContainer.appendChild(categoryElement);
            }
        });
    }

    // Detalles específicos
    const details = document.createElement('h3');
    details.textContent = '[3] Detalles Específicos de los sustantivos, verbos y adjetivos';
    morphologyContainer.appendChild(details);

    const detailedList = document.createElement('ul');
    data.morphology.filter(item => ['NOUN', 'VERB', 'ADJ'].includes(item.pos)).forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.text} (${item.pos}): ${formatFeatures(item.features)}`;
        detailedList.appendChild(listItem);
    });
    morphologyContainer.appendChild(detailedList);
}

function syntaxProcess() {
    const textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return;
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaText_Comprehend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
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

window.onload = function() {
    document.getElementById("syntaxButton").addEventListener("click", syntaxProcess);
};
