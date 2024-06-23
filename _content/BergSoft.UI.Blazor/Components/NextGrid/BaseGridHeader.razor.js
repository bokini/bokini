export function setupGridHeader(header, dotNetHelper) {
    header.addEventListener('contextmenu', function handler(event) {
        event.preventDefault();
        dotNetHelper.invokeMethodAsync('OnRightClick', event.clientX, event.clientY);
    });
}