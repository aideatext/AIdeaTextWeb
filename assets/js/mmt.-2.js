// Agregado dentro de DOMContentLoaded para garantizar que el DOM esté cargado completamente
// edición 1
document.addEventListener("DOMContentLoaded", function() {
    
    const syntaxNetworkContainer = document.getElementById("syntax-network");
    const syntaxButton = document.getElementById('translateButton'); // Asegúrate de usar el botón correcto
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
        const targetLanguage = document.getElementById('language-select').value; // Agrega esta línea para obtener el idioma
        if (!textInput.trim()) {
            console.error("El texto para analizar no puede estar vacío.");
            return;
        }

        progressBar.style.width = '0%';
        progressBar.style.display = 'block';

        fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput, target_language: targetLanguage }) // Agrega target_language aquí
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

                    if (data.arc_diagram && data.arc_diagram.trim().startsWith('<div')) {
                        clearContainer(syntaxNetworkContainer);
                        syntaxNetworkContainer.innerHTML = data.arc_diagram;
                        console.log("Displacy output has been inserted into the container.");
                    } else {
                        console.error("No se recibieron datos válidos del servidor:", data.arc_diagram);
                    }
                }
            }, 200); // Modifica este tiempo según la duración esperada del proceso

            if (data.translated_text) {
                document.getElementById('translation-result').innerText = `Texto traducido: ${data.translated_text}`;
            } else {
                console.error("No se recibió texto traducido del servidor");
            }

            if (data.audio_base64) {
                document.getElementById('audio-player').src = `data:audio/mp3;base64,${data.audio_base64}`;
            } else {
                console.error("No se recibió audio del servidor");
            }
        })
        .catch(error => {
            console.error("Error al procesar el texto:", error);
            clearInterval(interval);
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
