function visaKundvagn(){
    const kundvagn= JSON.parse(localStorage.getItem("kundvagn")) || [];
    const beställningarSektion= document.querySelector(".beställningar");
    beställningarSektion.innerHTML = '';

    Visa_max_antal= document.createElement("div");
    Visa_max_antal.innerHTML= "Max antal vid köp är 5 styckna"
    beställningarSektion.appendChild(Visa_max_antal);


    kundvagn.forEach((parfym) => {
        const parfymElement= document.createElement("div");
        parfymElement.innerHTML= `
        <img src= "${parfym.bild_url}" alt="${parfym.namn}" style="width: 100px;">
        <p>${parfym.namn} - ${parfym.pris} kr</p>
        <p>Antal:  <span id="antal-${parfym.parfym_id}">    ${parfym.antal}</span>
        <button class="minusButton" onclick="minska_antal_parfym('${parfym.parfym_id}')">-</button>
        <button class="plusButton" onclick="öka_antal_parfym('${parfym.parfym_id}')">+</button>
    </p>        `;
        beställningarSektion.appendChild(parfymElement)
    });
}



function minska_antal_parfym(parfym_id) {
    const antalElement = document.getElementById(`antal-${parfym_id}`);
    let antal = parseInt(antalElement.textContent);
    if (antal == 1) {
        remove_from_kundvagn(parfym_id); // Ta bort parfymen från kundvagnen om antalet är 1
        return;
    } else if (antal > 1) {
        antal--;
        antalElement.textContent = antal;
    }

    updateLocalStorage(parfym_id, antal);

    let minska_antal_korg= parseInt(localStorage.getItem("cartCount")) || 0;
    if(minska_antal_korg >= 1){
        minska_antal_korg -= 1;
    }
    localStorage.setItem("cartCount", minska_antal_korg);
}




function öka_antal_parfym(parfym_id) {
    const antalElement = document.getElementById(`antal-${parfym_id}`);
    let antal = parseInt(antalElement.textContent);

    if(antal <= 4) {
        antal++;
        antalElement.textContent = antal;
        updateLocalStorage(parfym_id, antal);
    
        let öka_antalet_korgen= parseInt(localStorage.getItem("cartCount")) ||0;
        öka_antalet_korgen ++;
        localStorage.setItem("cartCount", öka_antalet_korgen);
    }
}


function remove_from_kundvagn(parfym_id){
    let kundvagn = JSON.parse(localStorage.getItem("kundvagn"));
    let currentCount= parseInt(localStorage.getItem("cartCount"));
    if(currentCount > 0){
        currentCount -=1;
        localStorage.setItem("cartCount", currentCount);
    }

    let index = kundvagn.findIndex((item) => item.parfym_id == parfym_id);
    if (index !== -1) {
        kundvagn.splice(index, 1); 
        localStorage.setItem("kundvagn", JSON.stringify(kundvagn)); 
        location.reload();
        visaKundvagn();
    }
}



function updateLocalStorage(parfym_id, antal) {
    let kundvagn = JSON.parse(localStorage.getItem("kundvagn")) || [];
    const index = kundvagn.findIndex(item => item.parfym_id == parfym_id);
    if (index !== -1) {
        kundvagn[index].antal = antal;
        localStorage.setItem("kundvagn", JSON.stringify(kundvagn));        
    }
    else{
        console.log("Maybe you forget to uppload the parfym to localstorage, because the parfym you try to increase antal is not sotred in localstorage");
        console.log(kundvagn);
        return;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    visaKundvagn();

    document.getElementById("OKButton").addEventListener('click', get_info_database);

    function get_info_database(){
        const kundvagn = JSON.parse(localStorage.getItem("kundvagn")) || [];
        const parfymIdLista = kundvagn.map(parfym => parfym.parfym_id);
        const queryParams = parfymIdLista.map(id => `parfym_id=${id}`).join('&');

        const messageElement = document.createElement("div");
        if (parfymIdLista.length === 0) {
            messageElement.textContent = "Korgen är tom.";
            document.body.appendChild(messageElement); 
            return;
        }

        fetch(`/get_parfymer?${queryParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fel med svar till server`);
            }
            return response.json();
        })
        .then(data => {
            check_antal(data);
            
        })
        .catch(error => {
            console.error("Fel vid förfrågan till servern:", error);
        });
    }




    function check_antal(data) {
        fel_vid_beställning= false;
        const container = document.createElement("div");
        const kundvagn = JSON.parse(localStorage.getItem("kundvagn")) || [];

        kundvagn.forEach(item => {
            const matchingItem = data.find(entry => entry.parfym_id === item.parfym_id);
            if (matchingItem && item.antal > matchingItem.antal) {
                const figure = document.createElement("figure");
    
                const img = document.createElement("img");
                img.src = item.bild_url;
                img.alt = item.namn;
    
                const figcaption = document.createElement("figcaption");
                if (matchingItem.antal === 0) {
                    figcaption.textContent = `${item.namn}\nSlutsåld`;
                } else {
                    // figcaption.textContent = `${item.namn} Högt antal`;
                    figcaption.textContent = `${item.namn} Bara ${matchingItem.antal} i lager`;

                }
    
                figure.appendChild(img);
                figure.appendChild(figcaption);
                container.appendChild(figure);

                const köp_godkänt= document.getElementById("success_buy")
                köp_godkänt.innerHTML= "";
    

                fel_vid_beställning= true;
            }
        });


        if(!fel_vid_beställning){
          slutföra_köp(kundvagn);
        }

            const existingContainer = document.getElementById("parfym-container");
            if (existingContainer) {
                existingContainer.innerHTML = "";
                existingContainer.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
    }  




    function slutföra_köp(kundvagn){
      const parfym_id_lista= kundvagn.map(parfym =>{
        return {parfym_id: parfym.parfym_id, antal: parfym.antal};
      });
      console.log(parfym_id_lista);


      const request = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({parfym_id_lista})
      };


      fetch('/update_antal', request)

      .then(response =>{
        if(!response.ok){
          throw new error ("Fel vid förfrågan till server");
        }
        return response.json();
      })



      .then(data => {
        if(data.message === 1){
            const köp_godkänt= document.getElementById("success_buy")
            köp_godkänt.textContent= "Ali Zaghlout";
            document.body.appendChild(köp_godkänt);
        }
      })



      .catch(error => {
        console.error('Något gick fel:', error);
    });

    }
})