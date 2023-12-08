const searchbar = document.getElementById("searchbar")
const results = document.getElementsByClassName("searchbar-results")
searchbar.addEventListener("input", function () {
    let barSearch = searchbar.value.toLowerCase()
    for (i = 0 ; i < results.length ; i++) {
        const barIndex = results[i].textContent.toLowerCase()
        if (barIndex.includes(barSearch) & barSearch != "") {
            results[i].style.display = "flex"
        } else {
            results[i].style.display = "none"
        }
    }
})

