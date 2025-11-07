function getDockById(dockId) {
    const dock = document.getElementById(dockId);
    if (dock) {
        return createDockArgs(dock);
    }
    return null;
}
function getDockOrientation(dock) {
    return dock.dataset.vertical !== undefined ? Orientation.Vertical : Orientation.Horizontal;
}
function createDockArgs(dock) {
    return {
        dockId: dock.id,
        orientation: getDockOrientation(dock),
        tag: dock.dataset.tag
    };
}
function dock(control, dockId) {
    const dock = document.getElementById(dockId);
    if (dock && control) {
        dock.appendChild(control);
    }
}
function undock(control, dockId) {
    const dockEl = document.getElementById(dockId);
    if (dockEl && control) {
        dockEl.removeChild(control);
    }
}
function findDock(el) {
    const elRect = el.getBoundingClientRect();
    const docks = document.querySelectorAll('[data-dock]');
    for (const dock of docks) {
        const dockRect = inflateRect(dock.getBoundingClientRect(), 8, 8);
        if (rectsIntersect(elRect, dockRect)) {
            console.log(`Found dock: ${dock.id}`);
            return dock;
        }
    }
    return null;
}
function registerFloating(control, dotnet) {
    let floating = false;
    let origin = null;
    let offset = null;
    let handle;
    let toolbarRect;
    let dock = null;
    control.addEventListener("pointerdown", e => {
        handle = e.target;
        if (handle.classList.contains("drag-handle")) {
            e.preventDefault();
            floating = control.classList.contains("floating");
            toolbarRect = control.getBoundingClientRect();
            /* It need to be undocked, or already floating, */
            handle.setPointerCapture(e.pointerId);
            origin = { x: e.pageX, y: e.pageY };
            offset = {
                x: e.pageX - toolbarRect.left - window.scrollX,
                y: e.pageY - toolbarRect.top - window.scrollY
            };
            control.addEventListener("pointermove", onPointerMove);
            control.addEventListener("pointerup", onPointerUp, { once: true });
            control.addEventListener("pointercancel", onPointerUp, { once: true });
            control.addEventListener("touchmove", disableTouchMove, { passive: false });
        }
    });
    function resetDock(dock) {
        if (dock) {
            dock.classList.remove("floating-over");
        }
        dock = null;
    }
    function onPointerMove(e) {
        e.preventDefault();
        if (!floating) {
            if (distanceReach(origin, { x: e.pageX, y: e.pageY }, 4)) {
                startFloating(e);
            }
        }
        if (floating) {
            const position = { x: e.pageX - offset.x, y: e.pageY - offset.y };
            dotnet.invokeMethodAsync("SetPosition", `${position.x}px`, `${position.y}px`);
            const targetDock = findDock(control);
            if (targetDock != dock) {
                resetDock(dock);
                dock = targetDock;
                if (dock) {
                    const args = createDockArgs(dock);
                    dotnet.invokeMethodAsync("DockOver", args)
                        .then((canDock) => {
                        if (canDock) {
                            dock.classList.add("floating-over");
                        }
                    });
                }
            }
        }
    }
    /**
     * Toolbar is undocked and starts floating
     * @param e
     */
    function startFloating(e) {
        console.log("startFloating");
        floating = true;
        /* Notify dotnet to rerender */
        dotnet.invokeMethodAsync("StartFloating");
        control.classList.add("floating");
        /* Get the horizontal handle, as it is a different object */
        handle = control.querySelector(".drag-handle");
        handle.setPointerCapture(e.pointerId);
        origin = { x: e.pageX, y: e.pageY };
        const toolbarRect = control.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();
        const style = window.getComputedStyle(control);
        offset = {
            x: (handleRect.left - toolbarRect.left + parseInt(style.paddingLeft) + handleRect.width / 2),
            y: (handleRect.top - toolbarRect.top + parseInt(style.paddingTop) + handleRect.height / 2)
        };
        console.log(offset);
    }
    function endFloating(dock) {
        dotnet.invokeMethodAsync("DockStop", dock != null ? createDockArgs(dock) : null);
    }
    function onPointerUp(e) {
        handle.releasePointerCapture(e.pointerId);
        control.removeEventListener("pointermove", onPointerMove);
        control.removeEventListener("touchmove", disableTouchMove);
        endFloating(dock);
        resetDock(dock);
    }
}
function distanceReach(point1, point2, distance = dragDistance) {
    return point1 && Math.abs(point1.x - point2.x) > distance || point1 && Math.abs(point1.y - point2.y) > distance;
}
function disableTouchMove(e) {
    e.preventDefault();
}
function registerProgressBar(progress, min, max, dotNetReference) {
    const container = progress.parentElement;
    progress.addEventListener("pointerdown", e => {
        progress.setPointerCapture(e.pointerId);
        window.addEventListener("pointerup", endDragging, { once: true });
        window.addEventListener("pointercancel", endDragging, { once: true });
        window.addEventListener("pointermove", drag);
    });
    function endDragging(e) {
        progress.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", drag);
    }
    function drag(e) {
        const boundingRect = container.getBoundingClientRect();
        const relativeX = e.clientX - boundingRect.left;
        const clampedX = Math.max(0, Math.min(relativeX, boundingRect.width));
        const value = Math.round(clampedX / (boundingRect.width / (max - min)));
        if (value >= min && value <= max) {
            dotNetReference.invokeMethodAsync("SetProgressValue", value);
        }
    }
}
/**
 * Register a splitter events to allow resizing of adjacent elements
 *
 * @param splitter
 * @returns
 */
function registerSplitter(splitter) {
    if (splitter === null) {
        return;
    }
    let originalPosition;
    let originalSize;
    let prevPos;
    let horizontal = splitter.classList.contains("vertical") === false;
    let sibling;
    splitter.addEventListener("pointerdown", (e) => {
        sibling = splitter.previousElementSibling;
        if (sibling === null) {
            return;
        }
        splitter.setPointerCapture(e.pointerId);
        prevPos = horizontal ? e.clientY : e.clientX;
        originalSize = horizontal ? sibling.offsetHeight : sibling.offsetWidth;
        originalPosition = horizontal ? e.clientY : e.clientX;
        window.addEventListener("pointerup", stopDragging, { once: true });
        window.addEventListener("pointercancel", stopDragging, { once: true });
        window.addEventListener("pointermove", drag);
        window.addEventListener("touchmove", disableTouchMove, { passive: false });
    });
    function drag(e) {
        if (sibling) {
            let style = window.getComputedStyle(sibling, null);
            if (horizontal) {
                let minHeight = style.getPropertyValue("min-height");
                let height = originalSize - (originalPosition - e.clientY);
                if (height < parseInt(minHeight)) {
                    height = parseInt(minHeight);
                }
                sibling.style.height = height + "px";
                prevPos = e.clientY;
            }
            else {
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
    function stopDragging(e) {
        window.removeEventListener("pointermove", drag);
        window.removeEventListener("touchmove", disableTouchMove);
        splitter.releasePointerCapture(e.pointerId);
    }
}
/**
 * Setup events for resizing headers
 *
 * @param grid Grid element
 * @param dotnet Dotnet reference to call methods
 */
function registerHeadersResizing(grid, dotnet) {
    let headerIndex;
    let divider;
    let locationX;
    grid.addEventListener('pointerdown', e => {
        const target = e.target;
        const header = target.closest("th");
        if (!header) {
            return;
        }
        /* Index of header being resized or dragged */
        headerIndex = parseInt(header.dataset.index);
        if (target.classList.contains("divider")) {
            /* Can be resized? */
            if (target.classList.contains("fixed") === false) {
                divider = target;
                divider.setPointerCapture(e.pointerId);
                const headerRect = header.getBoundingClientRect();
                locationX = headerRect.x;
                window.addEventListener("pointermove", pointerMove);
                window.addEventListener("pointerup", pointerUp);
                window.addEventListener("pointercancel", pointerUp);
                window.addEventListener("touchmove", disableTouchMove, { passive: false });
            }
        }
    });
    function pointerMove(e) {
        let colSize = e.pageX - locationX;
        if (colSize < 8) {
            colSize = 8;
        }
        if (headerIndex == null) {
            throw new ReferenceError("Header index is null");
        }
        dotnet.invokeMethodAsync("HandleResize", headerIndex, `${colSize}px`);
    }
    const pointerUp = (e) => {
        locationX = null;
        headerIndex = null;
        divider.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", pointerMove);
        window.removeEventListener("pointerup", pointerUp);
        window.removeEventListener("pointercancel", pointerUp);
        window.removeEventListener("touchmove", disableTouchMove);
        divider = null;
    };
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
    let headerContent = null;
    headers.addEventListener('pointerdown', e => {
        const target = e.target;
        if (target.classList.contains("divider")) {
            return;
        }
        headersRect = headers.getBoundingClientRect();
        header = target.closest("th");
        headerContent = header.querySelector(".content");
        location = { x: e.pageX, y: e.pageY };
        const grid = header.closest('table');
        const gridStyle = window.getComputedStyle(grid);
        let draggedRect = header.getBoundingClientRect();
        offset = {
            x: e.pageX - draggedRect.left - grid.scrollLeft,
            y: e.pageY - draggedRect.top - grid.scrollTop
        };
        headerContent.setPointerCapture(e.pointerId);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp, { once: true });
        window.addEventListener("pointercancel", onPointerUp, { once: true });
        window.addEventListener("touchmove", disableTouchMove, { passive: false });
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
        headerContent.removeEventListener("pointermove", onPointerMove);
        headerContent.removeEventListener("pointerup", onPointerUp);
        headerContent.removeEventListener("touchmove", disableTouchMove);
    }
    function startDragging(e, header) {
        e.stopPropagation();
        dragging = true;
        dotNet.invokeMethodAsync("HandleDragStart", parseInt(header.dataset.index));
        header.setPointerCapture(e.pointerId);
    }
    function onPointerUp(e) {
        headerContent.releasePointerCapture(e.pointerId);
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
    function endDrag(e) {
        dotNet.invokeMethodAsync("HandleDragEnd");
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
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
            window.addEventListener("pointercancel", onPointerUp);
            window.addEventListener("touchmove", disableTouchMove, { passive: false });
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
        endDrag(e);
        if (item) {
            item.releasePointerCapture(e.pointerId);
        }
        item = null;
        canDrag = false;
        location = null;
        targetIndex = null;
        dragIndex = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchmove", disableTouchMove);
    }
}
/**
 * Register toolbar events to allow floating undocking
 *
 * @param control
 * @param dotNet
 */
function registerToolbar(control, dock, dotNet) {
    let floating = false;
    let origin = null;
    let offset = null;
    let handle;
    let toolbarRect;
    let canDrop = false;
    control.addEventListener("pointerdown", e => {
        handle = e.target;
        if (handle.classList.contains("drag-handle")) {
            e.preventDefault();
            floating = control.classList.contains("floating");
            toolbarRect = control.getBoundingClientRect();
            /* It need to be undocked, or already floating, */
            handle.setPointerCapture(e.pointerId);
            origin = { x: e.pageX, y: e.pageY };
            offset = {
                x: e.pageX - toolbarRect.left - window.scrollX,
                y: e.pageY - toolbarRect.top - window.scrollY
            };
            control.addEventListener("pointermove", onPointerMove);
            control.addEventListener("pointerup", onPointerUp, { once: true });
            control.addEventListener("pointercancel", onPointerUp, { once: true });
            control.addEventListener("touchmove", disableTouchMove, { passive: false });
        }
    });
    function onPointerMove(e) {
        e.preventDefault();
        if (!floating) {
            if (distanceReach(origin, { x: e.pageX, y: e.pageY }, 4)) {
                startFloating(e);
            }
        }
        if (floating) {
            const location = { x: e.pageX - offset.x, y: e.pageY - offset.y };
            dotNet.invokeMethodAsync("OnSetLocation", `${location.x}px`, `${location.y}px`);
            const dockRect = dock.getBoundingClientRect();
            const placeholderRect = new DOMRect(dockRect.left, dockRect.top, dockRect.width, dockRect.height + toolbarRect.height);
            canDrop = pointInRect({ x: e.clientX, y: e.clientY }, placeholderRect);
            if (canDrop) {
                dock.classList.add("floating-over");
                dock.style.height = `${toolbarRect.height}px`;
            }
            else {
                dock.classList.remove("floating-over");
                dock.style.height = "";
            }
        }
    }
    /**
     * Toolbar is undocked and starts floating
     * @param e
     */
    function startFloating(e) {
        floating = true;
        /* Notify dotnet to rerender */
        dotNet.invokeMethodAsync("OnStartFloating");
        control.classList.add("floating");
        /* Get the horizontal handle, as it is a different object */
        handle = control.querySelector(".drag-handle");
        handle.setPointerCapture(e.pointerId);
        origin = { x: e.pageX, y: e.pageY };
        const toolbarRect = control.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();
        const style = window.getComputedStyle(control);
        offset = {
            x: (handleRect.left - toolbarRect.left + parseInt(style.paddingLeft) + handleRect.width / 2) - window.scrollX,
            y: (handleRect.top - toolbarRect.top + parseInt(style.paddingTop) + handleRect.height / 2) - window.scrollY
        };
    }
    function onPointerUp(e) {
        handle.releasePointerCapture(e.pointerId);
        dock.style.height = "";
        control.removeEventListener("pointermove", onPointerMove);
        control.removeEventListener("touchmove", disableTouchMove);
        if (canDrop) {
            dotNet.invokeMethodAsync("OnDock");
        }
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
            this.dialog.addEventListener("touchmove", disableTouchMove, { passive: false });
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
                title.removeEventListener("touchmove", disableTouchMove);
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
function listenClickOutside(el, dotnet) {
    window.addEventListener('mousedown', function handler(e) {
        if (e.target !== el && el !== null && el.contains(e.target) === false) {
            dotnet.invokeMethodAsync("HandleClickOutside", e);
            window.removeEventListener('mousedown', handler);
        }
    });
}
const dragDistance = 2;
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
    Orientation[Orientation["Vertical"] = 1] = "Vertical";
})(Orientation || (Orientation = {}));
function flip(point) {
    return { x: point.y, y: point.x };
}
function inflateRect(rect, dx, dy) {
    return new DOMRect(rect.x - dx, rect.y - dy, rect.width + dx * 2, rect.height + dy * 2);
}
function pointInRect(point, rect) {
    return (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom);
}
function rectsIntersect(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
