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
  let pyodide = await loadPyodide();
  await loadPackages(pyodide);
  let vis_fn = await loadVisualize(pyodide);

  document.getElementById("submit").disabled = false;
  document.getElementById("submit").innerHTML = "Visualize";

  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let input = document.getElementById("input").value;
    let html = await vis_fn(input);
    document.getElementById("output").innerHTML = html;
  });
}

main();
