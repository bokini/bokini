export function getSiblingSize(splitter) {
    let sibling = splitter.previousElementSibling;
    if (sibling) {
        return sibling.clientWidth;
    }
    return 0;
}

export function connect(splitter) {
    let isDragging = false;
    let originalPosition;
    let originalSize;
    let sibling;

    splitter.addEventListener("pointermove", (e) => {
        if (isDragging) {
            if (sibling) {
                let style = window.getComputedStyle(sibling, null)
                let minWidth = style.getPropertyValue("min-width");
                let width = originalSize - (originalPosition - e.clientX);

                if (width < parseInt(minWidth)) {
                    width = parseInt(minWidth);
                }
                sibling.style.width = width + "px";
            }
        }

    });

    splitter.addEventListener("pointerdown", (e) => {
        sibling = e.currentTarget.previousElementSibling;
        isDragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        originalSize = sibling.offsetWidth;
        originalPosition = e.clientX;
    });

    splitter.addEventListener("pointerup", (e) => {
        isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    });
}