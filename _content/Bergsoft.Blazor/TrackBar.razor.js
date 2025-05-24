export function connect(dotnet, knob, currentPosition, min, max) {
    let isDragging = false;

    function calcKnobLeft(position) {
        return ((position - min) / (max - min)) * 100;
    }

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

    knob.addEventListener("pointerup", (e) => {
        isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    });

    function updateKnobAndProgress(value) {
        knob.style.left = `${calcKnobLeft(value)}%`;
        if (progress) {
            progress.style.width = `${calcKnobLeft(value)}%`;
        }
    }

    let slide = knob.parentElement;
    let progress = knob.previousElementSibling;
    let boundingRect = slide.getBoundingClientRect();
//    updateKnobAndProgress(currentPosition);
}