const img = document.querySelector("img");
const resultEle = document.querySelector(`.result`);
let objectDetector;

/** Detect objects in image. */
async function detect() {
    resultEle.textContent = "Loading...";
    if (!objectDetector) {
        objectDetector = await tflite.loadTFLiteModel(
            "https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite"
        );
    }
    
    const start = Date.now();
    let input = tf.image.resizeBilinear(tf.browser.fromPixels(img), [300, 300]);
    input = tf.cast(tf.expandDims(input), 'int32');
    
    // Run the inference and get the output tensors.
    let result = await objectDetector.predict(input);
    let boxes = Array.from(await result["TFLite_Detection_PostProcess"].data());
    let classes = Array.from(await result["TFLite_Detection_PostProcess:1"].data())
    let scores = Array.from(await result["TFLite_Detection_PostProcess:2"].data())
    let n = Array.from(await result["TFLite_Detection_PostProcess:3"].data())
    const latency = Date.now() - start;
    renderDetectionResult(boxes, classes, scores, n);
    resultEle.textContent = `Latency: ${latency}ms`;
}

/** Render detection results. */
function renderDetectionResult(boxes, classes, scores, n) {
    const boxesContainer = document.querySelector(".boxes-container");
    boxesContainer.innerHTML = "";
    for (let i = 0; i < n; i++) {
        const boundingBox = boxes.slice(i*4, (i+1)*4);
        const name = classes[i];
        const score = scores[i];
				const y_min = Math.floor(boundingBox[0] * img.clientHeight);
        const y_max = Math.floor(boundingBox[2] * img.clientHeight);
        const x_min = Math.floor(boundingBox[1] * img.clientWidth);
        const x_max = Math.floor(boundingBox[3] * img.clientWidth);
        if (score > 0.3) {
            const boxContainer = createDetectionResultBox(
                x_min,
                y_min,
                x_max - x_min,
                y_max - y_min,
                name,
                score
            );
            boxesContainer.appendChild(boxContainer);
        } 
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