export function connect(dotnet, el) {
    window.addEventListener('mousedown', function handler(e) {
        if (e.target !== el && el.contains(e.target) === false) {
            dotnet.invokeMethodAsync("HandleClickOutside", e);
            window.removeEventListener('mousedown', handler);
        }
    });

    /// need to be destroyed also when selected value
}