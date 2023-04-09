let submitForm = document.querySelector("form");
submitForm.addEventListener("submit", function (event) {
event.preventDefault();
let line = event.target["line"].value;
let station = event.target["station"].value;
let svgDoc = document.getElementById("subway").contentDocument;
if (station != "") {
    if (svgDoc.getElementById(station) != null) {
    svgDoc.getElementById(station).setAttribute("visibility", "visible");
    }
    else {
    let wrong = document.getElementById("wrong")
    console.log(station)
    wrong.setAttribute("style", "display: inline-block;");
    setTimeout(function () { wrong.setAttribute("style", "display: none;"); }, 2000);
    }
}
submitForm.reset();
})