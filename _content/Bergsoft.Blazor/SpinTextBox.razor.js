export function connectProgressBar(progress, dotNetReference, min, max) {
    if (progress == null)
        return;

    let isDragging = false;
    let bar = progress.parentElement;

    progress.addEventListener("pointerdown", e => {
        isDragging = true;
        progress.setPointerCapture(e.pointerId);
    });

    progress.addEventListener("pointerup", e => {
        isDragging = false;
        progress.releasePointerCapture(e.pointerId);
    });

    progress.addEventListener("pointermove", e => {
        if (isDragging) {
            const boundingRect = bar.getBoundingClientRect();

            const relativeX = e.clientX - boundingRect.left;
            const clampedX = Math.max(0, Math.min(relativeX, boundingRect.width));
            const value = Math.round(clampedX / (boundingRect.width / (max - min)));

            if (value >= min && value <= max) {
                dotNetReference.invokeMethodAsync("SetProgressValue", value);
            }
        }
    });

    const calculateWidth = value => ((value - min) / (max - min)) * 100;

    function updateProgress(value) {
        progress.style.width = `${calculateWidth(value)}%`;
    }
}