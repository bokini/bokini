export function connect(splitter) {
    let isDragging = false;
    let originalPosition;
    let originalSize;
    let prevPos;
    let horizontal = splitter.classList.contains("vertical") === false;
    let sibling;

    splitter.addEventListener("pointermove", (e) => {
        if (isDragging) {
            if (sibling) {
                let style = window.getComputedStyle(sibling, null)
                if (horizontal) {
                    let minHeight = style.getPropertyValue("min-height");
                    let height = originalSize - (originalPosition - e.clientY);
                    if (height < parseInt(minHeight)) {
                        height = parseInt(minHeight);
                    }
                    sibling.style.height = height + "px";
                    prevPos = e.clientY; 
                } else {
                    let minWidth = style.getPropertyValue("min-width");
//                    let delta = originalPosition - e.clientX;
                    let newWidth = originalSize - (originalPosition - e.clientX);
                    if (newWidth < parseInt(minWidth)) {
                        newWidth = parseInt(minWidth);
                    }
                    sibling.style.width = newWidth + "px";
                }
            }
        }

    });

    splitter.addEventListener("pointerdown", (e) => {
        sibling = e.currentTarget.previousElementSibling;
        isDragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        console.log(`e.clientX ${e.clientX} | siblingl.offsetWidth: ${sibling.offsetWidth}`)
        prevPos = horizontal ? e.clientY : e.clientX;

        originalSize = horizontal ? sibling.offsetHeight : sibling.offsetWidth;
        originalPosition = horizontal ? e.clientY : e.clientX;
    });

    splitter.addEventListener("pointerup", (e) => {
        isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    });
}