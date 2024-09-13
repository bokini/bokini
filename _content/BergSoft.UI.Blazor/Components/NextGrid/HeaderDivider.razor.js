export function setupHeaderDivider(divider) {

    let curCol, pageX, curColWidth;

    if (divider == null)
        return;

    divider.addEventListener("pointerdown", (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);

        /* curCol should be a TH el. */
        curCol = e.target.parentElement.parentElement;
        pageX = e.pageX;
        let padding = paddingDiff(curCol);

        curColWidth = curCol.offsetWidth - padding;
    });

    divider.addEventListener("pointermove", (e) => {
        if (curCol) {
            let diffX = e.pageX - pageX;
            curCol.style.width = (curColWidth + diffX) + 'px';
            if (curCol.style.minWidth) {
                curCol.style.minWidth = curCol.style.width;
            }
        }
    });


    divider.addEventListener("pointerup", (e) => {
        curCol = undefined;
        e.currentTarget.releasePointerCapture(e.pointerId);
    });

    function paddingDiff(col) {
        if (getStyleVal(col, 'box-sizing') == 'border-box') {
            return 0;
        }
        var padLeft = getStyleVal(col, 'padding-left');
        var padRight = getStyleVal(col, 'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));
    }

    function getStyleVal(elm, css) {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
    }
}