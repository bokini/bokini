export function connect(dialog, title) {
    if (title === null)
        return;
    let isMoving = false;
    let offset;

    title.addEventListener("pointermove", (e) => {
        if (isMoving) {
            dialog.style.left = (e.clientX + offset.x) + 'px';
            dialog.style.top = (e.clientY + offset.y) + 'px';
            offset = {
                x: dialog.offsetLeft - e.clientX,
                y: dialog.offsetTop - e.clientY
            }
        }
    });

    title.addEventListener("pointerdown", (e) => {
        if (title.classList.contains("Moving")) {
            isMoving = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            offset = {
                x: dialog.offsetLeft - e.clientX,
                y: dialog.offsetTop - e.clientY
            }
        }
    });

    title.addEventListener("pointerup", (e) => {
        isMoving = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    });
}