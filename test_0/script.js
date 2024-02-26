async function loadPackages(pyodide) {
  await pyodide.loadPackage(["micropip", "numpy", "pydantic"]);
}

async function loadVisualize(pyodide) {
  try {
    let response = await fetch("visualize.py");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let python_script = await response.text();
    await pyodide.runPythonAsync(python_script);
    return pyodide.globals.get("visualize");
  } catch (error) {
    console.error("Error loading visualize.py:", error);
  }
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
  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    let input = document.getElementById("input").value;
    let html = await vis_fn(input);

    document.getElementById("output").innerHTML = html;
  });
}

main();
