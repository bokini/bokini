export function addEvents(button) {
    if (button) {
        button.addEventListener("pointerdown", e => button.setPointerCapture(e.pointerId));
        button.addEventListener("pointerup", e => button.releasePointerCapture(e.pointerId));
    }
}