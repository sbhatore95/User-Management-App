// When the user clicks on <button>, open the popup
function popupToggle(id) {
    var popup = document.getElementById(id);
    popup.classList.toggle("show");
}

function popupViewCard(id1, id2, id3, username, email) {
    var popup = document.getElementById(id1);
    var p1 = document.getElementById(id2);
    var p2 = document.getElementById(id3);
    p1.innerHTML = 'Username: ' + username;
    p2.innerHTML = 'Email: ' + email;
    popup.classList.toggle("show");
}

function popupDelete(id1, id2, username) {
    var popup = document.getElementById(id1);
    var p1 = document.getElementById(id2);
    p1.innerHTML = username;
    popup.classList.toggle("show");
}