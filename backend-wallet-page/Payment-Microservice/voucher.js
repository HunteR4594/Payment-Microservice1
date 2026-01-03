    // Promo Code functionality
    const applyBtn = document.getElementById("applyPromoBtn");
    const promoInput = document.getElementById("promoCodeInput");

    applyBtn.addEventListener("click", () => {
        const code = promoInput.value.trim();
        if(code === "") {
            alert("Please enter a promo code.");
        } else {
            alert(`Promo code "${code}" applied!`);
            //pwede mag add ng discount or special offer
            promoInput.value = "";
        }
    });
