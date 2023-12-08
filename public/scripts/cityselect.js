const selector = document.getElementById('city-select')
selector.addEventListener('change', function() {
    console.log(selector.value)
    const tournamentDisplay = document.getElementsByClassName('tournaments')
    
    for (i = 0 ; i < tournamentDisplay.length ; i++) {
        const selectedCity = tournamentDisplay[i].getAttribute("data-city")
        if (selectedCity == selector.value || selector.value == "") {
            tournamentDisplay[i].style.display = "block"
        } else {
            tournamentDisplay[i].style.display = "none"
        }
    }
})