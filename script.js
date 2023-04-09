function showPopup(e) {
    const item = document.getElementById(e);
    item.setAttribute("style", "display: inline-block;");
    setTimeout(function () { item.setAttribute("style", "display: none;"); }, 2000);
}

function optionCheck(e) {
    if (e != "") { document.getElementById("defaultOption").outerHTML = ""; }
}

let submitForm = document.querySelector("form");
submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let line = event.target["line"].value;
    let station = event.target["station"].value;
    let svgElement = document.getElementById("map").contentDocument.getElementById(station);
    if (station != "") { // 빈 form이 아니라면
        // 역명이 존재하고, [호선 옵션이 비활성화되어 있거나 svg에 해당 호선이 존재하는 경우]
        if (svgElement != null && (line === "disabled" || svgElement.classList.contains(line))) {
            let currentState = svgElement.getAttribute("visibility")
            if (currentState === "hidden") {
                svgElement.setAttribute("visibility", "visible");
                showPopup("correct");
            }
            else { showPopup("duplicate"); }
        }
        else { showPopup("wrong"); }
    }
    submitForm.reset();
})