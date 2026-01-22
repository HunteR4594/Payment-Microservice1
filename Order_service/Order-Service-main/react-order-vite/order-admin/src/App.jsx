import { useState } from "react";
import "./App.css";


<header>
  <div className="header-container">
    <span className="header-subtext">Your dashboard for everything.</span>
  </div>
</header>


const TABS = ["All", "On-going", "Completed", "Cancellations"];


const ORDERS = [
  {
    id: 104,
    items: ["Classic Caffeebara Cold Brew x1"],
    address: "Joana Ogaya; Blk 14, Lot 3, Chino Roces Ave...",
    status: "Canceled",
    avatar: null,
  },
  {
    id: 105,
    items: ["Matchabara Cold Brew x1", "Matchabara Frappe x1"],
    address: "Mariel Anonuevo; Blk 8, Tandang Sora Ave...",
    status: "Completed",
    avatar: null,
  },
];


function filterByTab(orders, tab) {
  if (tab === "All") return orders;


  if (tab === "On-going") {
    return orders.filter((o) =>
      ["Preparing", "In-Transit"].includes(o.status)
    );
  }


  if (tab === "Completed") {
    return orders.filter((o) => o.status === "Completed");
  }


  if (tab === "Cancellations") {
    return orders.filter((o) =>
      ["Canceled", "Approved", "Cancellation Approved"].includes(o.status)
    );
  }


  return orders;
}


function statusClass(status) {
  switch (status) {
    case "Completed":
      return "status-success";
    case "Canceled":
    case "Approved":
    case "Cancellation Approved":
      return "status-danger";
    default:
      return "status-default";
  }
}


function App() {
  const [activeTab, setActiveTab] = useState("All");


  const visibleOrders = filterByTab(ORDERS, activeTab);


  return (
    <div className="bg-page min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="border-bottom bg-white">
        <div className="container-fluid py-3 d-flex align-items-center">
          <button
            className="back-arrow me-2"
            type="button"
            aria-label="Back"
            onClick={() => window.history.back()}
          >
            <img
              src="/assets/arrow.png"
              alt="Back"
              className="back-arrow-img"
            />
          </button>
          <span className="ms-auto me-3 header-subtext d-none d-md-block">
            Your dashboard for everything.
          </span>
        </div>
      </header>


      {/* Main content */}
      <main className="flex-grow-1">
        <section className="container-xl order-shell py-3">
          {/* Tabs */}
          <ul className="nav nav-pills justify-content-center gap-3 order-tabs mb-2">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  type="button"
                  className={
                    "nav-link px-4 py-2 rounded-pill fw-semibold " +
                    (activeTab === tab ? "active" : "")
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>


          <hr className="mt-3 mb-0 soft-divider" />


          {/* Order list */}
          <div className="order-list">
            {visibleOrders.map((order, index) => (
              <article key={`${order.id}-${index}`} className="order-row">
                <div className="row align-items-start py-3">
                  <div className="col-9">
                    <h2 className="order-number mb-1">
                      Order # {order.id}
                    </h2>


                    <p className="order-items mb-1">
                      {order.items.map((line, i) => (
                        <span
                          key={i}
                          className={i === 0 ? "fw-semibold" : ""}
                        >
                          {line}
                          <br />
                        </span>
                      ))}
                    </p>


                    <p className="order-address mb-0">
                      {order.address}
                    </p>
                  </div>


                  <div className="col-3 text-end">
                    <span
                      className={
                        "order-status d-inline-block mb-2 " +
                        statusClass(order.status)
                      }
                    >
                      {order.status}
                    </span>


                    {order.avatar && (
                      <div className="order-avatar-wrap">
                        <img
                          src={order.avatar}
                          alt="Customer"
                          className="order-avatar rounded-circle shadow"
                        />
                      </div>
                    )}
                  </div>
                </div>


                <hr className="m-0 soft-divider" />
              </article>
            ))}
          </div>


          {/* Footer message */}
          <div className="text-center footer-end py-5">
            <img
              src="/assets/capy.png"
              alt="capy"
              className="end-bear mb-3"
            />
            <p className="mb-1 footer-small">You&apos;ve reached the end.</p>
            <p className="mb-0 footer-text">
              Kape thinks you&apos;re doing great, Keep it up!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}


export default App;



