const img = document.querySelector("img");
const resultEle = document.querySelector(`.result`);
let objectDetector;

/** Detect objects in image. */
async function detect() {
    
    resultEle.textContent = "Loading...";
    if (!objectDetector) {
        objectDetector = await tfTask.ObjectDetection.CustomModel.TFLite.load({
            model: "https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite",
        })
    }

    const start = Date.now();
    const result = await objectDetector.predict(img);
    const latency = Date.now() - start;
    renderDetectionResult(result);
    resultEle.textContent = `Latency: ${latency}ms`;
}

/** Render detection results. */
function renderDetectionResult(result) {
    const boxesContainer = document.querySelector(".boxes-container");
    boxesContainer.innerHTML = "";
    const objects = result.objects;
    for (let i = 0; i < objects.length; i++) {
        const curObject = objects[i];
        const boundingBox = curObject.boundingBox;
        const name = curObject.className;
        const score = curObject.score;

        const boxContainer = createDetectionResultBox(
            boundingBox.originX,
            boundingBox.originY,
            boundingBox.width,
            boundingBox.height,
            name,
            score
        );
        boxesContainer.appendChild(boxContainer);
    }
}

/** Create a single detection result box. */
function createDetectionResultBox(left, top, width, height, name, score) {
    const container = document.createElement("div");
    container.classList.add("box-container");

    const box = document.createElement("div");
    box.classList.add("box");
    container.appendChild(box);

    const label = document.createElement("div");
    label.classList.add("label");
    label.textContent = `${name} (${score.toFixed(2)})`;
    container.appendChild(label);

    container.style.left = `${left - 1}px`;
    container.style.top = `${top - 1}px`;
    box.style.width = `${width + 1}px`;
    box.style.height = `${height + 1}px`;

    return container;
}

document.querySelector(".btn").addEventListener("click", () => {
    detect();
});