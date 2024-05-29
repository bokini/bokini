export function setupHeaderDivider(divider) {

    let curCol, pageX, curColWidth, tableWidth;

    divider.addEventListener("pointerdown", (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);

        /* curCol should be a TH el. */
        curCol = e.target.parentElement.parentElement;

        pageX = e.pageX;

        var padding = paddingDiff(curCol);

        curColWidth = curCol.offsetWidth - padding;
    });

    divider.addEventListener("pointermove", (e) => {
        if (curCol) {
            var diffX = e.pageX - pageX;
            curCol.style.width = (curColWidth + diffX) + 'px';
//            document.getElementById('tableId').style.width = tableWidth + diffX + "px"
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