/* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
function burgerDisplay() {
    let links = document.getElementById("links");
    if (links.style.display === "block") {
        links.style.display = "none";
    } else {
        links.style.display = "block";
    }
  }