const dragDistance = 2;
function distanceReach(point1, point2, distance = dragDistance) {
    return point1 && Math.abs(point1.x - point2.x) > distance || Math.abs(point1.y - point2.y) > distance;
}
function registerHeadersReordering(headers, dotNet) {
    let grid = null;
    let gridStyle;
    let header = null;
    let location = null;
    let offset = null;
    let dragIndex = null;
    let dragging = false;
    let headersRect;
    headers.addEventListener('pointerdown', e => {
        headersRect = headers.getBoundingClientRect();
        const target = e.target;
        header = target.closest("th");
        location = { x: e.pageX, y: e.pageY };
        grid = header.closest('table');
        gridStyle = window.getComputedStyle(grid);
        let draggedRect = header.getBoundingClientRect();
        offset = {
            x: e.pageX - draggedRect.left - grid.scrollLeft,
            y: e.pageY - draggedRect.top - grid.scrollTop
        };
        header.setPointerCapture(e.pointerId);
        header.addEventListener("pointermove", onPointerMove);
        header.addEventListener("pointerup", onPointerUp);
        header.addEventListener("touchmove", e => {
            e.preventDefault();
        }, { passive: false });
    });
    function onPointerMove(e) {
        let currentLocation = { x: e.pageX, y: e.pageY };
        if (!dragging && distanceReach(location, currentLocation)) {
            startDragging(e, header);
        }
        if (dragging) {
            drag(e);
        }
    }
    function findPosition() {
        const tr = header.parentNode;
        const headers = tr.querySelectorAll("th:not(.dragging)");
    }
    function calcPosition(e) {
        return { x: e.pageX - offset.x + window.scrollX, y: e.pageY - offset.y + window.scrollY };
    }
    function drag(e) {
        const otherHeaders = headers.querySelectorAll(".grid-header:not(.dragging)");
        let targetIndex = 0;
        let targetPosition = null;
        let position = calcPosition(e);
        for (const header of otherHeaders) {
            const headerRect = header.getBoundingClientRect();
            targetIndex = parseInt(header.dataset.index);
            targetPosition = { x: headerRect.left - 7, y: headerRect.top + window.scrollY };
            if (e.clientX < headerRect.left + headerRect.width / 2) {
                dotNet.invokeMethodAsync("HandleDragOver", targetIndex, `${position.x}px`, `${position.y}px`, `${targetPosition.x}px`, `${targetPosition.y}px`);
                return;
            }
        }
        targetPosition.x = headersRect.right - 7 + window.scrollX;
        targetIndex++;
        dotNet.invokeMethodAsync("HandleDragOver", targetIndex, `${position.x}px`, `${position.y}px`, `${targetPosition.x}px`, `${targetPosition.y}px`);
    }
    function endDragging() {
        dragging = false;
        location = null;
        dragIndex = null;
        dotNet.invokeMethodAsync("HandleDragEnd");
        header.removeEventListener("pointermove", onPointerMove);
        header.removeEventListener("pointerup", onPointerUp);
    }
    function startDragging(e, header) {
        dragging = true;
        dotNet.invokeMethodAsync("HandleDragStart", parseInt(header.dataset.index));
        header.setPointerCapture(e.pointerId);
    }
    function onPointerUp(e) {
        header.releasePointerCapture(e.pointerId);
        endDragging();
    }
}
/**
 * Connect the right-click event to the PopupMenu
 * @param el
 * @param dotNet
 */
function setupPopupMenu(el, dotNet) {
    if (el !== null) {
        el.addEventListener('contextmenu', e => {
            e.preventDefault();
            dotNet.invokeMethodAsync('OnRightClick', e.clientX, e.clientY);
        });
    }
}
/**
 * Setup drag and drop reordering for listbox
 * @param listbox
 * @param dotNet
 */
function setupReordering(listbox, dotNet) {
    const distance = 2;
    let deltaY = 0;
    let item = null;
    let dragIndex = null;
    let targetIndex = null;
    let location = null;
    let canDrag = false;
    let style;
    function reordering() {
        return listbox.classList.contains("reordering");
    }
    function startDrag(e, item) {
        dragIndex = parseInt(item.dataset.index);
        let draggedRect = item.getBoundingClientRect();
        deltaY = e.pageY - draggedRect.top - listbox.scrollTop;
        dotNet.invokeMethodAsync("HandleDragStart", dragIndex, calculateTop(e));
        item.setPointerCapture(e.pointerId);
    }
    function drag(e) {
        const items = listbox.querySelectorAll(".item:not(.dragging)");
        for (const item of items) {
            const itemRect = item.getBoundingClientRect();
            if (e.clientY < itemRect.top + itemRect.height / 2) {
                targetIndex = parseInt(item.dataset.index);
                dotNet.invokeMethodAsync("HandleDragOver", targetIndex, calculateTop(e));
                return;
            }
        }
        dotNet.invokeMethodAsync("HandleDragOver", targetIndex + 1, calculateTop(e));
    }
    if (listbox !== null) {
        style = window.getComputedStyle(listbox);
        listbox.addEventListener("pointerdown", e => {
            location = { x: e.pageX, y: e.pageY };
            const target = e.target;
            if (reordering()) {
                if (target.classList.contains("drag-handle")) {
                    item = target.parentNode;
                    canDrag = true;
                }
                else if (target.classList.contains("item")) {
                    item = target;
                }
                else {
                    item = target.closest(".item");
                }
                ;
            }
            if (canDrag && reordering()) {
                startDrag(e, item);
            }
            listbox.addEventListener("pointermove", onPointerMove);
            listbox.addEventListener("pointerup", onPointerUp);
            listbox.addEventListener("touchmove", e => {
                e.preventDefault();
            }, { passive: false });
        });
    }
    function calculateTop(e) {
        const listboxRect = listbox.getBoundingClientRect();
        const localY = e.pageY - listboxRect.top - parseInt(style.paddingTop);
        return `${localY - deltaY}px`;
    }
    function onPointerMove(e) {
        e.preventDefault();
        if (!canDrag) {
            if (location && Math.abs(location.x - e.pageX) > distance || Math.abs(location.y - e.pageY) > distance) {
                canDrag = true;
                if (reordering()) {
                    startDrag(e, item);
                }
            }
        }
        if (canDrag && reordering()) {
            drag(e);
        }
    }
    function onPointerUp(e) {
        if (item) {
            item.releasePointerCapture(e.pointerId);
        }
        item = null;
        canDrag = false;
        location = null;
        targetIndex = null;
        dragIndex = null;
        dotNet.invokeMethodAsync("HandleDragEnd");
        listbox.removeEventListener("pointermove", onPointerMove);
        listbox.removeEventListener("pointerup", onPointerUp);
    }
}
class Dialog {
    constructor(dialog, title, dotnet) {
        this.dialog = dialog;
        this.title = title;
        this.dotnet = dotnet;
        this.initialize = () => {
            let dragging = false;
            let offset;
            const dotnet = this.dotnet;
            const title = this.title;
            /* Prevent touch scrolling in Safari for iOS */
            this.dialog.addEventListener("touchmove", e => {
                e.preventDefault();
            }, { passive: false });
            title.addEventListener("pointerdown", e => {
                if (title.classList.contains("draggable")) {
                    dragging = true;
                    title.setPointerCapture(e.pointerId);
                    title.classList.add("dragging");
                    offset = {
                        x: this.dialog.offsetLeft - e.clientX,
                        y: this.dialog.offsetTop - e.clientY
                    };
                }
                title.addEventListener("pointermove", titlePointerMove);
                title.addEventListener("pointerup", titlePointerUp);
            });
            function titlePointerMove(e) {
                if (dragging) {
                    const position = {
                        x: e.clientX + offset.x,
                        y: e.clientY + offset.y
                    };
                    dotnet.invokeMethodAsync("SetPosition", `${position.x}px`, `${position.y}px`);
                }
            }
            function titlePointerUp(e) {
                dragging = false;
                title.releasePointerCapture(e.pointerId);
                title.classList.remove("dragging");
                title.removeEventListener("pointermove", titlePointerMove);
                title.removeEventListener("pointerup", titlePointerUp);
            }
        };
        this.initialize();
    }
}
window.dialogFactory = {
    create: (dialog, title, dotNetHelper) => {
        return new Dialog(dialog, title, dotNetHelper);
    }
};
//# sourceMappingURL=scripts.js.map