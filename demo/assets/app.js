
function log(data) {
    const str = typeof data === "string" ? data : JSON.stringify(data);
    logPane.innerHTML += "<div class='log-message'>" + str + '</div>';
}

function logArr(arr, comment) {
    let str = "<div class='log-message'>";
    str += comment ? "<b>"+comment+"</b>" : "";
    str += "<div class='log-row'>" + arr.map(JSON.stringify).join("</div><div class='log-row'>") + "</div>";
    str += "</div>";
    logPane.innerHTML += str;
}

function printArr(arr) {
    return "<div class='log-row'>" + arr.map(JSON.stringify).join("</div><div class='log-row'>") + "</div>";
    
}

function com(command) {
    let str = "<div class='log-message'>";
    str += "<b>" + command + "</b>";
    let res = eval(command);
    if (Array.isArray(res)) {
        str += printArr(res);
    } else if (typeof res === "object") {
        str += "<pre>" +JSON.stringify(res, null, " ")+ "</pre>";
    } else {
        str += String(res);
    }
    str += "</div>";

    logPane.innerHTML += str;
}