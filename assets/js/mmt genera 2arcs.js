// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
// v54
document.addEventListener("DOMContentLoaded", function() {
    
    const syntaxNetworkContainerEs = document.getElementById("syntax-network-es");
    const syntaxNetworkContainerFr = document.getElementById("syntax-network-fr");
    const syntaxButton = document.getElementById('syntaxButton');
    const progressBar = document.getElementById('progressBar');

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

        fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput })
        })
        .then(response => response.text())
        .then(html => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10; // Incrementar progreso más lentamente
                progressBar.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                    setTimeout(() => { progressBar.style.display = 'none'; }, 500);

                    if (html.trim().startsWith('<div')) {
                        clearContainer(syntaxNetworkContainerEs);
                        clearContainer(syntaxNetworkContainerFr);
                        syntaxNetworkContainerEs.innerHTML = html;
                        syntaxNetworkContainerFr.innerHTML = html;
                        console.log("Displacy output has been inserted into both containers.");
                    } else {
                        console.error("No se recibieron datos válidos del servidor:", html);
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

    if (syntaxButton) {
        syntaxButton.addEventListener('click', syntaxProcess);
    } else {
        console.error("El botón de análisis sintáctico no se encuentra en el DOM.");
    }
});
