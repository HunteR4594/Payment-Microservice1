// HOW TO RUN ORDER-HISTORY-PAGE

#1: cd order-service
#2: cd react-order-vite
#3: cd order-history-page
#4: npm install
#5: npm run dev
#6: npm install react-bootstrap bootstrap
#7: npm run dev

Note: kapag hindi nag reflect yung page sa step 5, proceed sa step 6. if nag run naman na, no need na for steps 6 and 7

// SAMPLE API INTEGRATION LOGIC

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  fetchOrders();
}, []);

// SAMPLE RESPONSE NG BACKEND

[
  {
    "id": 1,
    "name": "Classic Matchabara Cold Brew",
    "status": "Ongoing",
    "items": 1,
    "date": "2025-12-04T10:00:00",
    "price": 120,
    "image": "classic_matchabara_cold_brew.png"
  }
]

Note: pasabi nalang if may need i-modify