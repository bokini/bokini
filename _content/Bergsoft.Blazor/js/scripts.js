function setupReordering(listbox, dotNetRef) {
    let item = null;
    let deltaY = 0;
    let dragIndex, newIndex = null;

    if (listbox !== null) {

        const style = window.getComputedStyle(listbox);

        listbox.addEventListener("pointerdown", e => {

            if (e.target.classList.contains("drag-handle")) {

                item = e.target.parentNode;
                dragIndex = parseInt(item.dataset.index);

                let draggedRect = item.getBoundingClientRect();

                deltaY = e.pageY - draggedRect.top - listbox.scrollTop;

                dotNetRef.invokeMethodAsync("HandleDragStart", dragIndex, calculateTop(e))

                item.setPointerCapture(e.pointerId);

                listbox.addEventListener("pointermove", onPointerMove);
                listbox.addEventListener("pointerup", onPointerUp);
            }
        });

        function calculateTop(e) {
            const listboxRect = listbox.getBoundingClientRect();
            const localY = e.pageY - listboxRect.top - parseInt(style.paddingTop);
            return `${localY - deltaY}px`;
        }

        function onPointerMove(e) {
            if (!item)
                return;

            e.preventDefault();

            const items = [...listbox.querySelectorAll(".item:not(.dragging)")];
            for (let item of items) {
                const itemRect = item.getBoundingClientRect();
                if (e.clientY < itemRect.top + itemRect.height / 2) {
                    newIndex = parseInt(item.dataset.index);
                    dotNetRef.invokeMethodAsync("HandleDragOver", newIndex, calculateTop(e));
                    return;
                }
            }
            dotNetRef.invokeMethodAsync("HandleDragOver", newIndex + 1, calculateTop(e));
        }

        function onPointerUp(e) {
            if (!item)
                return;

            item.releasePointerCapture(e.pointerId);
            item = null;

            dotNetRef.invokeMethodAsync("HandleDragEnd");

            listbox.removeEventListener("pointermove", onPointerMove);
            listbox.removeEventListener("pointerup", onPointerUp);

        }
    }
}