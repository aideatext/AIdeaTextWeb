// Contenedor para la red sintáctica
const syntaxNetworkContainer = document.getElementById("syntax-network");

/**
 * Obtiene un elemento del DOM por su ID.
 * @param {string} id - El ID del elemento.
 * @returns {HTMLElement} - El elemento del DOM.
 */
function getContainerElement(id) {
    return document.getElementById(id);
}

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container - El contenedor a limpiar.
 */
function clearContainer(container) {
    container.innerHTML = '';
}

/**
 * Encuentra la palabra más común en un array de palabras.
 * @param {Array} words - El array de palabras.
 * @returns {string} - La palabra más común.
 */
function findMostCommonWordInText(words) {
    const wordFrequency = {};
    
    // Contar la frecuencia de cada palabra
    words.forEach(word => {
        const normalizedWord = word.toLowerCase(); // Convertir la palabra a minúsculas para evitar distinciones de mayúsculas y minúsculas
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    });
    
    // Encontrar la palabra con la frecuencia más alta
    let mostCommonWord = '';
    let highestFrequency = 0;
    
    for (const word in wordFrequency) {
        if (wordFrequency[word] > highestFrequency) {
            mostCommonWord = word;
            highestFrequency = wordFrequency[word];
        }
    }
    
    return mostCommonWord;
}

/**
 * Encuentra la palabra más común en un conjunto de nodos.
 * @param {Array} nodes - Los nodos a analizar.
 * @returns {Object} - El nodo más común.
 */
function findMostCommonWord(nodes) {
    return nodes.reduce((max, node) => {
        return node.frequency > max.frequency ? node : max;
    }, nodes[0]);
}


/**
 * Encuentra la palabra menos común en un conjunto de nodos.
 * @param {Array} nodes - Los nodos a analizar.
 * @returns {Object} - El nodo menos común.
 */
function findLeastCommonWord(nodes) {
    return nodes.reduce((min, node) => {
        return node.frequency < min.frequency ? node : min;
    }, nodes[0]);
}

/**
 * Visualiza los datos recibidos del backend.
 * @param {Object} data - Los datos recibidos del backend.
 */
function visualizeGraph(data) {
    syntaxNetworkContainer.innerHTML = ''; // Limpiar el contenedor de red sintáctica
    
    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntaxCirclePacking(data.syntax, syntaxNetworkContainer);
    }
}

/**
 * Procesa el texto ingresado.
 */

function syntaxProcess() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/callmodel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend para el análisis sintáctico:", data);
        
        if (data.syntax && Array.isArray(data.syntax.nodes)) {
            console.log("Verificación previa a visualizeSyntaxCirclePacking:", data.syntax.nodes);
            // Verifica que data.syntax.nodes es un arreglo antes de proceder
            visualizeSyntaxCirclePacking(data.syntax.nodes); // Ahora estamos pasando el arreglo de nodos correctamente
        } else {  
            console.error("Error: No se encontraron datos de análisis sintáctico válidos en la respuesta del servidor o los datos no están en el formato esperado.");
        }
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error);
    });
}


/**
 * Definir etiquetas en español 
 * @param {Object} POSLabes 
 */
const POSLabels = {
    adp: 'preposición',
    conj: 'conjunción',
    sconj: 'conjunción subordinante',
    adv: 'adverbio',
    det: 'determinante',
    noun: 'sustantivo',
    verb: 'verbo',
    adj: 'adjetivo',
    pron: 'pronombre',
    propn: 'nombre propio'
};

// Función para visualizar el análisis sintáctico usando Circle Packing
function visualizeSyntaxCirclePacking(syntaxData) {
    console.log("Datos recibidos en visualizeSyntaxCirclePacking:", syntaxData);
    // Primero, asegurémonos de que syntaxData es realmente un arreglo
    if (Array.isArray(syntaxData)) {
        // Solo si syntaxData es un arreglo, procedemos a construir la jerarquía y a visualizar
        const diameter = 600; // Diámetro del círculo principal
        const margin = 20;   // Margen alrededor del círculo

        // Preparar el contenedor SVG
        const svg = d3.select(syntaxNetworkContainer).append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        // Aquí es donde se construye la jerarquía de datos
        const hierarchyData = buildHierarchy(syntaxData); // Pasamos el arreglo de nodos
        const root = d3.hierarchy(hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        // Configuración del layout de empaquetamiento
        const pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

        pack(root);

        // Creación y estilización de nodos
        const node = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("circle")
            .attr("r", d => d.r)
            .style("fill", d => d.depth === 1 ? color(d.data.name) : "lightgrey")
            .style("opacity", 0.7);

        node.filter(d => !d.children)
            .append("text")
            .attr("dy", "0.3em")
            .style("text-anchor", "middle")
            .text(d => `${d.data.name.substring(0, d.r / 3)}`);

        // Aquí deberías definir la escala de colores como antes
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    } else {
        console.error('El argumento syntaxData debe ser un arreglo');
    }
}

    // Función para construir la jerarquía de datos a partir de los nodos de análisis sintáctico
    function buildHierarchy(nodes) {
        console.log("Construyendo jerarquía con:", nodes);
        let categories = {};
        nodes.forEach(node => {
            if (!categories[POSLabels[node.type] || node.type]) {
                categories[POSLabels[node.type] || node.type] = { name: POSLabels[node.type] || node.type, children: [] };
            }
            let wordExists = categories[POSLabels[node.type] || node.type].children.find(child => child.name === node.text);
            if (wordExists) {
                wordExists.value += 1;
            } else {
                categories[POSLabels[node.type] || node.type].children.push({ name: node.text, value: 1 });
            }
        });

        let hierarchy = { name: "root", children: [] };
        for (let key in categories) {
            hierarchy.children.push(categories[key]);
        }
        return hierarchy;
    }

// Llamar a la función visualizeSyntaxCirclePacking con los datos de análisis sintáctico
function syntaxProcess() {
    // Aquí, realizar la llamada AJAX para obtener los datos de análisis sintáctico
    // y luego llamar a visualizeSyntaxCirclePacking(data) con esos datos
    const mockSyntaxData = {/* simulación de datos sintácticos */};
    visualizeSyntaxCirclePacking(mockSyntaxData);
}

/////////////////////////////////////////////////////////////////////////////////////
// Llamar a la función syntaxProcess al cargar la página
syntaxProcess();
