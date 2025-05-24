export function getTotalWidth(elements) {
    if (!elements || elements.length === 0) {
        return 0;
    }
    console.log("Total: " + elements.length);
    let totalWidth = 0;
    elements.forEach(element => {
        if (element) {
            //    const rect = element.getBoundingClientRect();
            console.log(element);
            totalWidth += element.offsetWidth;
        }
    });
    return totalWidth;
};