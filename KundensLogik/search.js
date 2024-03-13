document.addEventListener('DOMContentLoaded', function() {
    var searchForm = document.getElementById('searchForm');
    updateCounter2();
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var parfymName = document.getElementById('searchInput').value;

            fetch('/search?parfymNamn=' + parfymName)
            .then(response => response.json())
            .then(data => {
                var searchResults = document.getElementById('searchResults');
                searchResults.innerHTML = "";

                if (data.message === "Parfymen finns i databasen!") {
                    data.parfymer.forEach(parfym => {
                        const figure = document.createElement("figure");
                        figure.classList.add("styleParfymBild");

                        const img = document.createElement("img");
                        img.src = parfym.bild_url;
                        img.alt = parfym.parfymNamn;

                        const figcaption = document.createElement("figcaption");
                        figcaption.innerHTML = `${parfym.parfymNamn}<br>${parfym.beskrivning}<br>${parfym.pris} kr`;

                        const button = document.createElement("button");
                        button.textContent = "Lägg till i kundvagn";
                        button.classList.add("styleParfymButton");

                        button.addEventListener('click', function() {
                            addToCart(parfym);
                        });

                        figure.appendChild(img);
                        figure.appendChild(figcaption);
                        figure.appendChild(button);

                        searchResults.appendChild(figure);
                    });
                } else {
                    searchResults.textContent = data.message;
                }
            })
            .catch(error => console.error('Fel:', error));
        });
    }




    function addToCart(parfym){
        let kundvagn= JSON.parse(localStorage.getItem("kundvagn")) || [];
        const finnsredan= kundvagn.find((item) => item.parfym_id == parfym.parfym_id);
    
        if(!finnsredan){
            kundvagn.push({
                parfym_id: parfym.parfym_id,
                namn: parfym.parfymNamn,
                pris: parfym.pris,
                bild_url: parfym.bild_url,
                antal: 1,
                
            });
            localStorage.setItem("kundvagn",JSON.stringify(kundvagn));
            console.log("Ali");
            updateCounter();
        }
        else{
            const nuvarandeparfym= kundvagn.find((item) => item.parfym_id == parfym.parfym_id)

            if(nuvarandeparfym.antal <= 4) {
                nuvarandeparfym.antal += 1;
                localStorage.setItem("kundvagn", JSON.stringify(kundvagn));
                updateCounter();
            }
        }
    }


    function updateCounter(){ //Siffran frmaför korgen
        let currentCount= parseInt(localStorage.getItem("cartCount")) || 0;
        currentCount ++;
        localStorage.setItem("cartCount", currentCount);
    
        let counterElement= document.getElementById("counter");
        counterElement.innerText= currentCount;
    
    }
    

    function updateCounter2(){ //Siffran frmaför korgen
        let currentCount= parseInt(localStorage.getItem("cartCount")) || 0;
        localStorage.setItem("cartCount", currentCount);
        let counterElement= document.getElementById("counter");
        counterElement.innerText= currentCount;

    }
    


    window.addEventListener('storage', function(event){
    if(event.key == "cartCount"){
        let currentCount= parseInt(localStorage.getItem("cartCount"));
        let counterElement= document.getElementById("counter");
        counterElement.innerText= currentCount;
    }
})

    
});
