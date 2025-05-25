export function connect(dotnet, knob, currentPosition, min, max) {
    let isDragging = false;

    let slide = knob.parentElement;
    let progress = knob.previousElementSibling;
    let boundingRect = slide.getBoundingClientRect();

    function calcKnobLeft(position) {
        return ((position - min) / (max - min)) * 100;
    }

    function startDragging(e) {
        isDragging = true;
        knob.setPointerCapture(e.pointerId);
    }

    function stopDragging(e) {
        isDragging = false;
        knob.setPointerCapture(e.pointerId);
    }

    slide.addEventListener("pointerup", e => stopDragging(e));

    slide.addEventListener("pointerdown", (e) => {
        const relativeX = e.clientX - boundingRect.left;
        const clampedX = Math.max(0, Math.min(relativeX, boundingRect.width));
        const position = Math.round(clampedX / (boundingRect.width / (max - min)));

        if (position >= min && position <= max) {
            updateKnobAndProgress(position);
            dotnet.invokeMethodAsync("PositionChangedAsync", position);
        }

        startDragging(e);
    });

    knob.addEventListener("pointermove", (e) => {
        if (isDragging) {
            const relativeX = e.clientX - boundingRect.left;
            const clampedX = Math.max(0, Math.min(relativeX, boundingRect.width));
            const position = Math.round(clampedX / (boundingRect.width / (max - min)));
                

            if (position >= min && position <= max) {
                updateKnobAndProgress(position);
                dotnet.invokeMethodAsync("PositionChangedAsync", position);
            }
        }
    });

    knob.addEventListener("pointerdown", (e) => {
        isDragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    });

    knob.addEventListener("pointerup", e => stopDragging(e));

    function updateKnobAndProgress(value) {
        knob.style.left = `${calcKnobLeft(value)}%`;
        if (progress) {
            progress.style.width = `${calcKnobLeft(value)}%`;
        }
    }
}