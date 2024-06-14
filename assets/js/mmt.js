// 2222v
document.addEventListener("DOMContentLoaded", function() {
    const translatedTextContainer = document.getElementById("translated-text");
    const translateButton = document.getElementById('translateButton');
    const progressBar = document.getElementById('progressBar');

    translateButton.addEventListener('click', translateProcess);

    function clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        } else {
            console.error("El contenedor no existe en el DOM.");
        }
    }

    function translateProcess() {
        const textInput = document.getElementById("text-1").value;
        if (!textInput.trim()) {
            console.error("El texto para traducir no puede estar vacío.");
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

                    if (data.translated_text) {
                        clearContainer(translatedTextContainer);
                        translatedTextContainer.innerText = `Texto traducido: ${data.translated_text}`;
                        console.log("La traducción ha sido insertada en el contenedor.");
                    } else {
                        console.error("No se recibió texto traducido del servidor");
                        console.log("Datos recibidos del servidor:", data); // Imprimir los datos recibidos para depuración
                    }
                }
            }, 200); // Modifica este tiempo según la duración esperada del proceso
        
        })
        .catch(error => {
            console.error("Error al procesar la traducción:", error);
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'red';
        });
    }

    if (translateButton) {
        translateButton.addEventListener('click', translateProcess);
    } else {
        console.error("El botón de traducción no se encuentra en el DOM.");
    }
});
