function setupReordering(listbox) {
    let dragged = null;
    let placeholder = null;
    let deltaY = 0;
    const bounds = listbox.getBoundingClientRect();

    if (listbox !== null) {

        listbox.addEventListener("pointerdown", e => {

            if (e.target.classList.contains("drag-handle")) {

//                bounds = listbox.getBoundingClientRect();
                const localY = e.pageY - bounds.top;
                console.log('localY: ' + localY);

                listbox.style.position = 'relative';

                offsetY = e.offsetY;

                dragged = e.target.parentNode;

                // Rect of the handle
                let draggedRect = dragged.getBoundingClientRect();
                const targetRect = e.target.getBoundingClientRect();
                const targetY = e.pageY;// - targetRect.top;

                placeholder = document.createElement("div");
                placeholder.classList.add("placeholder");

                dragged.parentNode.insertBefore(placeholder, dragged);

                //dragged.parentNode.removeChild(dragged);

                //document.body.appendChild(dragged);
                dragged.classList.add("dragging");

                dragged.style.position = 'absolute';

                console.log('handleY: ' + targetY);

//                dragged.style.top = z -  + "px";

                let top = localY;// (localY - targetRect.height) - 4;

                deltaY = e.pageY - draggedRect.top;

//                console.log("delta: " + delta);

                dragged.style.top = `${top - deltaY}px`;

                dragged.style.left = `0`;
                dragged.style.width = `${listbox.getBoundingClientRect().width}px`;
                dragged.style.userSelect = 'none';

                //dragged.setPointerCapture(e.pointerId);

                listbox.addEventListener("pointermove", onPointerMove);
                listbox.addEventListener("pointerup", onPointerUp);
            }
        });

        function calculateTop(e) {
            const localY = e.pageY - bounds.top;
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

            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
        }
    }
}