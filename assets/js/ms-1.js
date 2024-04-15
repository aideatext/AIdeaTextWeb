/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeGraph(data) {
    clearContainer(syntaxNetworkContainer); // Limpiar el contenedor antes de agregar nuevo contenido

    if (!data) {
        console.error("No data received.");
        return;
    }
    
    // Parsea el cuerpo JSON si es necesario
    const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    
    // Crea un elemento de tipo 'div' para mostrar los resultados
    const resultsDiv = document.createElement('div');
    
    // Agrega información general sobre el texto
    const wordCount = document.createElement('p');
    wordCount.textContent = `Total de palabras: ${parsedData.word_count}`;
    resultsDiv.appendChild(wordCount);

    const mostCommonWord = document.createElement('p');
    mostCommonWord.textContent = `Palabra más común: ${parsedData.most_common_word}`;
    resultsDiv.appendChild(mostCommonWord);

    const leastCommonWord = document.createElement('p');
    leastCommonWord.textContent = `Palabra menos común: ${parsedData.least_common_word}`;
    resultsDiv.appendChild(leastCommonWord);

    // Visualización del análisis sintáctico
    const syntaxTitle = document.createElement('h3');
    syntaxTitle.textContent = 'Análisis Sintáctico:';
    resultsDiv.appendChild(syntaxTitle);

    const syntaxList = document.createElement('ul');
    parsedData.syntax.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item[0]} (POS: ${item[1]})`;
        syntaxList.appendChild(listItem);
    });
    resultsDiv.appendChild(syntaxList);

    // Visualización del análisis morfológico
    const morphologyTitle = document.createElement('h3');
    morphologyTitle.textContent = 'Análisis Morfológico:';
    resultsDiv.appendChild(morphologyTitle);

    const morphologyList = document.createElement('ul');
    parsedData.morphology.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item[0]}: ${JSON.stringify(item[1])}`;
        morphologyList.appendChild(listItem);
    });
    resultsDiv.appendChild(morphologyList);

    // Añade el 'div' de resultados al contenedor principal
    syntaxNetworkContainer.appendChild(resultsDiv);
}

// Llamar a la función syntaxProcess al cargar la página
window.onload = syntaxProcess;
