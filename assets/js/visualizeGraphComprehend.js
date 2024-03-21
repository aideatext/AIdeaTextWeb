function processText() {
    var textInput = document.getElementById("text").value;
    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaText_Comprehend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data); // Imprime los datos en la consola
        visualizeEntitiesAndPhrases(data); // Llama a una nueva función para visualizar entidades y frases clave
    })
    .catch(error => console.error('Error al llamar a la API:', error));
}

