function findMostCommonWord(nodes) {
    return nodes.reduce((max, node) => {
      return node.frequency > max.frequency ? node : max;
    }, nodes[0]);
}
  
function findLeastCommonWord(nodes) {
    return nodes.reduce((min, node) => {
      return node.frequency < min.frequency ? node : min;  
    }, nodes[0]);
}

function processText() {
    var textInput = document.getElementById("text-1").value;
    if (!textInput.trim()) {
        console.error("El texto para analizar no puede estar vacío.");
        return; // Detener la ejecución si el texto está vacío
    }

    fetch('https://5f6b6akff7.execute-api.us-east-2.amazonaws.com/DEV/AIdeaTextdisplaCy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos del backend:", data);
        // Visualiza la sintaxis del texto en la página web
        visualizeGraph(data); // Asegúrate de que esta línea esté presente
    })
    .catch(error => {
        console.error("Error al procesar el texto:", error)
    });
}

function visualizeGraph(data) {
    const networkContainer = document.getElementById("network-1");
    const countContainer = document.getElementById("count-section-1");
    networkContainer.innerHTML = ''; // Corregido de network-1Container a networkContainer
    countContainer.innerHTML = ''; // Corregido de count-1Container a countContainer

    if (data.syntax) {
        // Visualización del Análisis Sintáctico
        visualizeSyntax(data.syntax, countContainer);
    }

    if (data.entities) {
        // Visualización del Análisis Semántico (Grafo)
        visualizeSemantic(data.entities, data.cra, networkContainer);
    }
}

function visualizeSyntax(syntaxData, countContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    countContainer.innerHTML = '';

    if (!syntaxData || !syntaxData.pos_count) {
        console.error("Error: No se encontraron datos de análisis sintáctico válidos.");
        return;
    }

    console.log("Datos de análisis sintáctico recibidos:", syntaxData);

    if (!syntaxData.nodes) {
        console.error("Error: No se encontraron nodos de análisis sintáctico.");
        return;
    }

    // Recuento de palabras
    const wordCount = syntaxData.nodes.length;

    // Verificar si syntaxData.pos_count está definido correctamente
    if (!syntaxData.pos_count || typeof syntaxData.pos_count !== 'object') {
        console.error("Error: El conteo de palabras por función gramatical no está definido correctamente.");
        return;
    }

    // Conteo de palabras por función gramatical
    const wordCountByPOS = syntaxData.pos_count;

    // Palabras por categoría gramatical
    const POSLabels = {
        det: 'determinante',
        noun: 'sustantivo',
        verb: 'verbo',
        adj: 'adjetivo',
        adv: 'adverbio',
        adp: 'preposición',
        conj: 'conjunción',
        num: 'número',
        pron: 'pronombre',
        propn: 'nombre propio',
        punct: 'puntuación',
        sconj: 'conjunción subordinante'
    };

    // Verificar si wordCountByPOS está definido correctamente
    if (!wordCountByPOS || typeof wordCountByPOS !== 'object') {
        console.error("Error: El conteo de palabras por función gramatical no está definido correctamente.");
        return;
    }

    // Palabra más común
    const mostCommonWord = findMostCommonWord(syntaxData.nodes);

    // Verificar si mostCommonWord está definido correctamente
    if (!mostCommonWord || typeof mostCommonWord !== 'object') {
        console.error("Error: La palabra más común no está definida correctamente.");
        return;
    }

    // Palabra menos común
    const leastCommonWord = findLeastCommonWord(syntaxData.nodes);

    // Verificar si leastCommonWord está definido correctamente
    if (!leastCommonWord || typeof leastCommonWord !== 'object') {
        console.error("Error: La palabra menos común no está definida correctamente.");
        return;
    }

    // Obtener el conteo de oraciones
    const sentenceCount = syntaxData.sentence_count;
    
    // Identificación de tipos de oraciones
    const sentenceTypes = {
        simple: syntaxData.pos_count['SIMPLE'] || 0,
        compound: syntaxData.pos_count['COMPOUND'] || 0,
        subordinate: syntaxData.pos_count['SUBORDINATE'] || 0
    };

    // Crear un elemento para mostrar la información de sintaxis
    const syntaxInfoElement = document.createElement('div');
    syntaxInfoElement.innerHTML = `
        <span>El texto tiene ${wordCount} palabras.</span><br>
        <span>La palabra que más se repite es: "${mostCommonWord.text}".</span><br>
        <span>La palabra que menos se repite es: "${leastCommonWord.text}".</span><br>
        <span>Conteo de palabras por función gramatical:</span><br>
    `;
    
 // Mostrar el recuento de palabras por función gramatical y las primeras diez palabras de cada categoría
    Object.entries(wordCountByPOS).forEach(([pos, count]) => {
        const posLabel = POSLabels[pos] || pos;
        syntaxInfoElement.innerHTML += `<span>[${count}] son ${posLabel}. `;
        if (syntaxData.pos_words && syntaxData.pos_words[pos]) {
            syntaxInfoElement.innerHTML += `Las primeras diez palabras: ${syntaxData.pos_words[pos].slice(0, 10).join(', ')}</span><br>`;
        } else {
            syntaxInfoElement.innerHTML += `No se encontraron palabras.</span><br>`;
        }
    });

    // Verificar si pos_words está presente en syntaxData
    if (syntaxData.pos_words) {
        // Mostrar las diez primeras palabras por cada categoría gramatical
        Object.entries(syntaxData.pos_words).forEach(([pos, words]) => {
            syntaxInfoElement.innerHTML += `<span>Las diez primeras palabras de la categoría gramatical "${pos}": ${words.slice(0, 10).join(', ')}</span><br>`;
        });
    }

    // Mostrar información sobre oraciones
    syntaxInfoElement.innerHTML += `
        <span>El texto tiene ${sentenceCount} oraciones. De las cuales:</span><br>
        <span>${sentenceTypes.simple} son oraciones simples.</span><br>
        <span>${sentenceTypes.compound} son oraciones compuestas con 2 o más verbos.</span><br>
        <span>${sentenceTypes.subordinate} son oraciones subordinadas.</span><br>
    `;
    
    countContainer.appendChild(syntaxInfoElement);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function visualizeSemantic(entities, craData, networkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    networkContainer.innerHTML = ''; // Corregido de network-1Container a networkContainer

    // Creamos un elemento de lista para mostrar las entidades nombradas
    const entityList = document.createElement('ul');

    // Recorremos las entidades encontradas en el análisis semántico
    entities.forEach(entity => {
        // Creamos un elemento de lista para cada entidad
        const listItem = document.createElement('li');
        listItem.textContent = entity;
        entityList.appendChild(listItem);
    });

    // Agregamos la lista al contenedor
    networkContainer.appendChild(entityList);

    // Visualizamos los resultados del CRA
    visualizeCRA(craData, networkContainer);
}

function visualizeCRA(craData, networkContainer) {
    // Limpiamos el contenedor antes de mostrar los resultados
    networkContainer.innerHTML = ''; // Corregido de network-1Container a networkContainer

    // Configuración del contenedor SVG
    const width = 1200;
    const height = 800;
    const svg = d3.select(networkContainer).append("svg") // Corregido de network-1Container a networkContainer
        .attr("width", width)
        .attr("height", height);

    // Escalador para asignar tamaños proporcionales a los nodos basados en su importancia
    const scaleNodeSize = d3.scaleLinear()
        .domain([0, d3.max(craData.map(node => node.weight))])
        .range([5, 30]); // Tamaño del nodo entre 5 y 30 píxeles

    // Creamos los nodos y los enlaces basados en los datos del CRA
    const nodes = craData.map(node => ({ id: node.id, size: scaleNodeSize(node.weight) }));

    // Creamos la simulación de fuerzas
    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Dibujamos los nodos
    const node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => d.size)
        .attr("fill", "#66ccff"); // Color azul para los nodos

    // Etiquetas de texto para los nodos
    const text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("x", 8)
        .attr("y", "0.31em");

    // Actualizamos la posición de los elementos en cada paso de la simulación
    simulation.on("tick", () => {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        text
            .attr("x", d => d.x + 10)
            .attr("y", d => d.y);
    });
}
