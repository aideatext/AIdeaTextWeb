async function loadPackages(pyodide) {
  await pyodide.loadPackage(["micropip", "numpy", "pydantic"]);
}

async function loadVisualize(pyodide) {
  let python_script = await fetch("/test_0/visualize.py")
    .then((r) => r.text())
    .then((python_script) => {
      console.log(python_script); // Para verificar que se carga el script correcto
      return pyodide.runPythonAsync(python_script);
    })
    .catch((error) => {
      console.error("Error loading visualize.py:", error);
    });

  return await pyodide.runPythonAsync(python_script);
}

async function main() {
  // Set default value for input
  document.getElementById("input").value = "Hello! Guess what? I'm running Python in your browser!\n\nMy name is Clara and I live in Berkeley, California.";

  // Load Pyodide and packages
  let pyodide = await loadPyodide();

  await loadPackages(pyodide);

  // Load visualize function
  let vis_fn = await loadVisualize(pyodide);

  // Enable the form button and change label
  document.getElementById("submit").disabled = false;
  document.getElementById("submit").innerHTML = "Visualize";

  // Add event listener to form
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();

    let input = document.getElementById("input").value;
    let html = vis_fn(input);

    document.getElementById("output").innerHTML = html;
  });
}

main();
