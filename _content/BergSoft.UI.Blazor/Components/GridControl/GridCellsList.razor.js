export function focusElement(element) {
    if (element) {
        console.log(element);
        element.focus();
        console.log(document.activeElement);
    } else {
        alert("is null");
    }
}