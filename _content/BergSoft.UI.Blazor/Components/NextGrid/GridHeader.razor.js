export function setupGridHeader(header, dotNetHelper) {
    if (header !== null) {
        header.addEventListener('contextmenu', function handler(event) {
            event.preventDefault();
            dotNetHelper.invokeMethodAsync('OnRightClick', event.clientX, event.clientY);
        });
    }
}