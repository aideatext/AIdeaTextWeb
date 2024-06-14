// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
// v6
document.addEventListener("DOMContentLoaded", function() {
    
    const syntaxNetworkContainerEs = document.getElementById("syntax-network-es");
    const syntaxNetworkContainerFr = document.getElementById("syntax-network-fr");
    const translateButton = document.getElementById('syntaxButton');
    const progressBar = document.getElementById('progressBar');
    const translationResult = document.getElementById('translation-result');

    translateButton.addEventListener('click', syntaxProcess);

    function clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        } else {
            console.error("El contenedor no existe en el DOM.");
        }
    }
    
    function syntaxProcess() {
        const textInput = document.getElementById("text-1").value;
        if (!textInput.trim()) {
            console.error("El texto para analizar no puede estar vacío.");
            return;
        }

        progressBar.style.width = '0%';
        progressBar.style.display = 'block';

        fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10; // Incrementar progreso más lentamente
                progressBar.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                    setTimeout(() => { progressBar.style.display = 'none'; }, 500);

                    if (data.arc_diagram_es && data.arc_diagram_es.trim().startsWith('<div')) {
                        clearContainer(syntaxNetworkContainerEs);
                        syntaxNetworkContainerEs.innerHTML = data.arc_diagram_es;
                        console.log("Displacy output (ES) has been inserted into the container.");
                    } else {
                        console.error("No se recibieron datos válidos del servidor para el diagrama en español:", data.arc_diagram_es);
                    }

                    if (data.translated_text) {
                        translationResult.innerText = `Texto traducido: ${data.translated_text}`;
                    } else {
                        console.error("No se recibió texto traducido del servidor");
                    }

                    if (data.arc_diagram_fr && data.arc_diagram_fr.trim().startsWith('<div')) {
                        clearContainer(syntaxNetworkContainerFr);
                        syntaxNetworkContainerFr.innerHTML = data.arc_diagram_fr;
                        console.log("Displacy output (FR) has been inserted into the container.");
                    } else {
                        console.error("No se recibieron datos válidos del servidor para el diagrama en francés:", data.arc_diagram_fr);
                    }
                }
            }, 200); // Modifica este tiempo según la duración esperada del proceso
        
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error);
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'red';
        });
    }

    if (translateButton) {
        translateButton.addEventListener('click', syntaxProcess);
    } else {
        console.error("El botón de análisis sintáctico no se encuentra en el DOM.");
    }
});
