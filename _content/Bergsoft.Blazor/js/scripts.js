function setupReordering(control) {
    let dragged = null;
    let offsetY = 0;
    let placeholder = null;

    if (control !== null) {

        control.addEventListener("pointerdown", e => {

            if (e.target.classList.contains("drag-handle")) {
                e.preventDefault();

                offsetY = e.offsetY;

                dragged = e.target.parentNode;
                const rect = dragged.getBoundingClientRect();

                placeholder = document.createElement("div");
                placeholder.classList.add("placeholder");

                dragged.parentNode.insertBefore(placeholder, dragged);

                dragged.parentNode.removeChild(dragged);

                document.body.appendChild(dragged);
                dragged.classList.add("dragging");

                dragged.style.position = 'absolute';
                dragged.style.top = `${rect.top}px`;
                dragged.style.left = `${rect.left}px`;
                dragged.style.width = `${control.getBoundingClientRect().width}px`;
                dragged.style.userSelect = 'none';

                document.addEventListener("pointermove", onPointerMove);
                document.addEventListener("pointerup", onPointerUp);
            }
        });

        function onPointerMove(e) {
            if (!dragged)
                return;
            e.preventDefault();
            dragged.style.top = e.clientY - offsetY + "px";

            const items = [...control.querySelectorAll(".item:not(.dragging)")];
            for (let item of items) {
                const box = item.getBoundingClientRect();
                if (e.clientY < box.top + box.height / 2) {
                    control.insertBefore(placeholder, item);
                    return;
                }
            }
            control.appendChild(placeholder);
        }

        function onPointerUp() {
            if (!dragged)
                return;

            // Inserts before the placeholder
            dragged.remove();
            control.insertBefore(dragged, placeholder);           

            dragged.classList.remove("dragging");
            dragged.style.top = '';
            dragged.style.left = '';
            dragged.style.width = '';
            dragged.style.position = '';

            placeholder.remove();
            placeholder = null;

            dragged = null;

            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
        }
    }
}