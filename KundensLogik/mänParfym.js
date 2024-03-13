function getParfymer(){
    fetch('/api/ManParfymURL')
    .then((response)=>{
        if(!response.ok){
            throw new Error ("Error with response");
        }
        return response.json();
    })
    .then((response)=>{
        const section= document.querySelector("section");

        response.forEach(function(parfym){
            const figure= document.createElement("figure");
            figure.classList.add("styleParfymBild");

            const img= document.createElement("img");
            img.src= parfym.bild_url;
            img.alt= parfym.parfymNamn;

            const figcaption= document.createElement("figcaption");
            figcaption.innerHTML = `${parfym.parfymNamn}<br>${parfym.beskrivning}<br>${parfym.pris} kr`;


            const button= document.createElement("button");
            button.textContent= "Lägg till i kundvagn";
            button.classList.add("styleParfymButton");

            button.addEventListener('click', function(){
                addToCart(parfym);
            });

            figure.appendChild(img);
            figure.appendChild(figcaption);
            figure.appendChild(button);

            section.appendChild(figure);
        });
    })
    .catch((error) =>{
        console.error("Fel vid hämtning av parfymer", error);
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


window.addEventListener('storage', function(event){
    if(event.key == "cartCount"){
        let currentCount= parseInt(localStorage.getItem("cartCount"));
        let counterElement= document.getElementById("counter");
        counterElement.innerText= currentCount;
    }
})


document.addEventListener("DOMContentLoaded",function(){
    getParfymer();
    let currentCount= parseInt(localStorage.getItem("cartCount")) || 0;
    let counterElement= document.getElementById("counter");
    counterElement.innerText= currentCount;

});