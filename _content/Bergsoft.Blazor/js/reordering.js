function setReordering(listbox, dotNet) {
    let deltaY = 0;
    const style = getComputedStyle(listbox);
    let item = null;
    let dragIndex = null;
    listbox.addEventListener("pointerdown", (event) => {
        if (event.target instanceof HTMLElement) {
            if (event.target.classList.contains("drag-handle")) {
                item = event.target.parentNode;
                dragIndex = parseInt(item.dataset.index);
                let draggedRect = item.getBoundingClientRect();
                deltaY = event.pageY - draggedRect.top;
                dotNet.invokeMethodAsync("HandleDragStart", dragIndex, calculateTop(event));
                item.setPointerCapture(event.pointerId);
                listbox.addEventListener("pointermove", onPointerMove);
                listbox.addEventListener("pointerup", onPointerUp);
            }
        }
    });
    function calculateTop(e) {
        const listboxRect = listbox.getBoundingClientRect();
        const localY = e.pageY - listboxRect.top - parseInt(style.paddingTop);
        return `${localY - deltaY}px`;
    }
    function onPointerMove(event) {
        dotNet.invokeMethodAsync('OnDragStart', event.clientX, event.clientY);
    }
    function onPointerUp(event) {
        listbox.removeEventListener("pointermove", onPointerMove);
        listbox.removeEventListener("pointerup", onPointerUp);
        item.releasePointerCapture(event.pointerId);
        item = null;
        dotNet.invokeMethodAsync("HandleDragEnd");
    }
}
//# sourceMappingURL=reordering.js.map