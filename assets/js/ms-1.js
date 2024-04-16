// Contenedor para la red morfológica
const morphologyContainer = document.getElementById("syntax-network");

function clearContainer(container) {
    container.innerHTML = '';
}

function formatMorphFeature(features) {
    return features.map(f => {
        const [key, value] = f.split('=');
        switch (key) {
            case 'Gender':
                return value === 'Fem' ? 'Femenino' : 'Masculino';
            case 'Number':
                return value === 'Sing' ? 'Singular' : 'Plural';
            case 'Tense':
                return value === 'Pres' ? 'Presente' : value === 'Past' ? 'Pasado' : value;
            case 'Person':
                return `Persona: ${value}`;
            default:
                return `${key}: ${value}`;
        }
    }).join(', ');
}

function visualizeMorphology(data) {
    clearContainer(morphologyContainer);

    if (!data) {
        console.error("No data received.");
        return;
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.style.backgroundColor = "#f0f0f0";
    resultsDiv.style.padding = "10px";
    resultsDiv.style.borderRadius = "8px";

    const generalInfo = document.createElement('h3');
    generalInfo.textContent = '[1] Resumen General';
    resultsDiv.appendChild(generalInfo);

    const wordCount = document.createElement('p');
    wordCount.textContent = `Cantidad Total de Palabras: ${data.totalWords}`;
    resultsDiv.appendChild(wordCount);

    const mostCommonWord = document.createElement('p');
    mostCommonWord.textContent = `Palabra más Común: ${data.mostCommonWord} [${data.mostCommonWordCount}]`;
    resultsDiv.appendChild(mostCommonWord);

    const posDistributionTitle = document.createElement('h3');
    posDistributionTitle.textContent = '[2] Distribución de Categorías Gramaticales';
    resultsDiv.appendChild(posDistributionTitle);

    const posList = document.createElement('ul');
    Object.entries(data.posCount).forEach(([pos, details]) => {
        const item = document.createElement('li');
        item.textContent = `${pos} [${details.count}]: ${Object.entries(details.words).map(([word, count]) => `${word} [${count}]`).join(', ')}`;
        posList.appendChild(item);
    });
    resultsDiv.appendChild(posList);

    const detailedMorphTitle = document.createElement('h3');
    detailedMorphTitle.textContent = '[3] Detalles Específicos de Sustantivos, Verbos y Adjetivos';
    resultsDiv.appendChild(detailedMorphTitle);

    const morphList = document.createElement('ul');
    data.morphology.forEach(item => {
        if (['NOUN', 'VERB', 'ADJ'].includes(item.pos)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.text} (${item.pos}): ${formatMorphFeature(Object.entries(item.features).map(([k, v]) => `${k}=${v}`))}`;
            morphList.appendChild(listItem);
        }
    });
    resultsDiv.appendChild(morphList);

    morphologyContainer.appendChild(resultsDiv);
}

function syntaxProcess() {
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
    document.getElementById("syntaxButton").addEventListener("click", syntaxProcess);
};
