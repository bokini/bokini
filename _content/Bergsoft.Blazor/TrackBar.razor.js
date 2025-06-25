export function connect(dotnet, knob, hasProgress, progressRef, min, max) {
    let isDragging = false;

    let trackBar = knob.parentElement;
    const bounds = trackBar.getBoundingClientRect();
    const knobBounds = knob.getBoundingClientRect();

    const calcKnobLeft = position => ((position - min) / (max - min)) * 100;

    const calcPosition = e => {
        const relativeX = e.clientX - bounds.left;
        const clampedX = Math.max(0, Math.min(relativeX, bounds.width));
        return Math.round(clampedX / (bounds.width / (max - min)));
    }

    function startDragging(e) {
        isDragging = true;
        knob.setPointerCapture(e.pointerId);
    }

    function stopDragging(e) {
        isDragging = false;
        knob.setPointerCapture(e.pointerId);
    }

    trackBar.addEventListener("pointerup", e => stopDragging(e));

    trackBar.addEventListener("pointerdown", e => {
        const position = calcPosition(e);
        if (position >= min && position <= max) {
            updateKnobAndProgress(position);
            dotnet.invokeMethodAsync("PositionChangedAsync", position);
        }

        startDragging(e);
    });

    knob.addEventListener("pointermove", e => {
        if (isDragging) {
            const position = calcPosition(e);
                
            if (position >= min && position <= max) {
                //updateKnobAndProgress(position);
                dotnet.invokeMethodAsync("PositionChangedAsync", position);
            }
        }
    });

    knob.addEventListener("pointerdown", e => {
        isDragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    });

    knob.addEventListener("pointerup", e => stopDragging(e));

    function updateKnobAndProgress(value) {
        knob.style.left = `calc(${calcKnobLeft(value)}% - ${knobBounds.height / 2}px)`;
        if (hasProgress) {
            progressRef.style.width = `${calcKnobLeft(value)}%`;
        }
    }
}