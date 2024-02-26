import micropip

PACKAGES_PATH = "/test_0/packages"
CUSTOM_BUILT_PKG_NAMES = [
    f"{PACKAGES_PATH}/{name}-cp310-cp310-emscripten_3_1_14_wasm32.whl"
    for name in [
        "blis-0.7.8", "cymem-2.0.6", "murmurhash-1.0.7", "preshed-3.0.6",
        "srsly-2.4.3", "thinc-8.1.0", "spacy-3.4.0",
    ]
]
SPACY_MODEL_NAME = "en_core_web_sm"
SPACY_MODEL_VERSION = "3.4.0"

# Asegurarse que las rutas a los archivos WHL son correctas
await micropip.install(
    [f"{PACKAGES_PATH}/{SPACY_MODEL_NAME}-{SPACY_MODEL_VERSION}-py3-none-any.whl"]
    + CUSTOM_BUILT_PKG_NAMES
)

from pyodide import to_js
import spacy
from spacy import displacy

def visualize(text):
    nlp = spacy.load(SPACY_MODEL_NAME)
    doc = nlp(text)
    render = displacy.render(doc, style="ent")
    return to_js(render)

visualize
