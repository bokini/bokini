export function getElementPosition(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
    };
}

export function listenRightClick(element, dotNetHelper) {
    element.addEventListener('contextmenu', function handler(event) {
        event.preventDefault();
        dotNetHelper.invokeMethodAsync('OnRightClick', event.clientX, event.clientY);
    });
}