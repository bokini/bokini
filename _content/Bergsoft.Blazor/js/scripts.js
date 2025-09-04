function setupReordering(listbox) {
    let dragged = null;
    let placeholder = null;
    let deltaY = 0;

    if (listbox !== null) {

        listbox.addEventListener("pointerdown", e => {

            if (e.target.classList.contains("drag-handle")) {
                listbox.style.position = 'relative';

                dragged = e.target.parentNode;

                let draggedRect = dragged.getBoundingClientRect();
                const targetY = e.pageY;

                placeholder = document.createElement("div");
                placeholder.classList.add("placeholder");
                placeholder.style.height = `${draggedRect.height}px`;

                dragged.parentNode.insertBefore(placeholder, dragged);
                dragged.classList.add("dragging");

                dragged.style.position = 'absolute';

                deltaY = e.pageY - draggedRect.top;

                const style = window.getComputedStyle(listbox);

                dragged.style.top = calculateTop(e);

                dragged.style.left = style.paddingLeft;
                dragged.style.width = `${draggedRect.width}px`;
                dragged.style.userSelect = 'none';

                //dragged.setPointerCapture(e.pointerId);

                listbox.addEventListener("pointermove", onPointerMove);
                listbox.addEventListener("pointerup", onPointerUp);
            }
        });

        function calculateTop(e) {
            const listboxRect = listbox.getBoundingClientRect();
            const localY = e.pageY - listboxRect.top;
            return `${localY - deltaY}px`;
        }

        function onPointerMove(e) {
            if (!dragged)
                return;

            e.preventDefault();
            dragged.style.top = calculateTop(e);

            const items = [...listbox.querySelectorAll(".item:not(.dragging)")];
            for (let item of items) {
                const box = item.getBoundingClientRect();
                if (e.clientY < box.top + box.height / 2) {
                    listbox.insertBefore(placeholder, item);
                    return;
                }
            }
            listbox.appendChild(placeholder);
        }

        function onPointerUp() {
            if (!dragged)
                return;

            // Inserts before the placeholder
            dragged.remove();
            listbox.insertBefore(dragged, placeholder);           
            listbox.style.position = '';

            dragged.classList.remove("dragging");
            dragged.style.top = '';
            dragged.style.left = '';
            dragged.style.width = '';
            dragged.style.position = '';

            placeholder.remove();
            placeholder = null;

            dragged = null;

            listbox.removeEventListener("pointermove", onPointerMove);
            listbox.removeEventListener("pointerup", onPointerUp);
        }
    }
}