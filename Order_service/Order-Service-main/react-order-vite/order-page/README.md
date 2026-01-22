// HOW TO RUN ORDER-HISTORY-PAGE

#1: cd order-service
#2: cd react-order-vite
#3: cd order-page
#4: npm install
#5: npm run dev
#6: npm install react-bootstrap bootstrap
#7: npm run dev

Note: kapag hindi nag reflect yung page sa step 5, proceed sa step 6. if nag run naman na, no need na for steps 6 and 7

// SAMPLE API INTEGRATION LOGIC ULI HAHAHAHAHA (HALOS SAME LANG TO ACTUALLY SA ORDER HISTORY PAGE)

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/products/1");
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  fetchProduct();
}, []);

// SAMPLE RESPONSE NG BACKEND

{
  "id": 1,
  "name": "Classic Matchabara Cold Brew",
  "image": "classic_matchabara_cold_brew.png",
  "prices": {
    "M": 120,
    "L": 140
  }
}

// SAMPLE ADD TO CART PAYLOAD

{
  "productId": 1,
  "name": "Classic Matchabara Cold Brew",
  "size": "M",
  "quantity": 2,
  "price": 120,
  "total": 240,
  "notes": "Less ice please"
}

Note: pasabi nalang if may need i-modify