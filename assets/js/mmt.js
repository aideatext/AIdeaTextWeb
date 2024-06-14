// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
// v9989
document.addEventListener("DOMContentLoaded", function() {
    const syntaxNetworkContainerEs = document.getElementById("syntax-network-es");
    const syntaxNetworkContainerFr = document.getElementById("syntax-network-fr");
    const syntaxButton = document.getElementById('syntaxButton');
    const progressBar = document.getElementById('progressBar');
    const translationResult = document.createElement('div');
    syntaxNetworkContainerFr.parentNode.insertBefore(translationResult, syntaxNetworkContainerFr);

    syntaxButton.addEventListener('click', syntaxProcess);

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
                progress += 10;
                progressBar.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                    setTimeout(() => { progressBar.style.display = 'none'; }, 500);

                    if (data.arc_diagram_es) {
                        clearContainer(syntaxNetworkContainerEs);
                        syntaxNetworkContainerEs.innerHTML = data.arc_diagram_es;
                    } else {
                        console.error("No se recibieron datos válidos del servidor para el diagrama en español:", data.arc_diagram_es);
                    }

                    if (data.translated_text) {
                        translationResult.innerText = `Texto traducido: ${data.translated_text}`;
                    } else {
                        console.error("No se recibió texto traducido del servidor");
                    }

                    if (data.arc_diagram_fr) {
                        clearContainer(syntaxNetworkContainerFr);
                        syntaxNetworkContainerFr.innerHTML = data.arc_diagram_fr;
                    } else {
                        console.error("No se recibieron datos válidos del servidor para el diagrama en francés:", data.arc_diagram_fr);
                    }
                }
            }, 200);
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error);
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'red';
        });
    }

    if (syntaxButton) {
        syntaxButton.addEventListener('click', syntaxProcess);
    } else {
        console.error("El botón de análisis sintáctico no se encuentra en el DOM.");
    }
});
