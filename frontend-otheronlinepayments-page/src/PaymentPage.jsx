import './PaymentPage.css'
import kapebaraLogo from './assets/kapebara-logo.png'
import bootstrapLogo from './assets/bootstrap-logo.svg'

function Logo() {
  return (
    <div className="logo-wrap">
      <img src={kapebaraLogo} alt="Kapebara logo" className="logo-img" />
    </div>
  )
}

export default function PaymentPage() {
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
const formattedDate = dueDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
const formattedTime = dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

return (
    <main className="payment-page">
        <div className="page-inner">
            <section className="left">
                <header>
                    <Logo />
                </header>

                <p className="due">Pay before {formattedDate} at 12:00 PM</p>

                <div className="balance">
                    <div className="currency">₱</div>
                    <div className="amount">[BALANCE].00</div>
                </div>
<div className="payment-method">
    {/* Corrected label/icon structure using the 'icon-text' class for styling */}
    <div className="pm-label">
        <i className="bi bi-bank" aria-hidden="true"></i>
        <span className="pm-text">Payment Method</span>
    </div>
    
    {/* Dropdown structure for selection */}
    <div className="pm-select">
        <select className="payment-select">
            <option value="direct-debit">Direct Debit</option>
            <option value="credit-card">Credit Card</option>
            <option value="gcash">GCash</option>
        </select>
        {/* Using the CSS-generated arrow (no external FA dependency) */}
    </div>
</div>
            </section>

            <aside className="right">
                <div className="order-header">
                    <h2>Order Summary</h2>
                </div>

                <div className="summary-row">
                    <div className="label">Invoice #:</div>
                    <div className="value">NNNNNN-LLLLLL</div>
                </div>

                <div className="summary-item">
                    <div className="item-head"><i className="bi bi-receipt" aria-hidden="true"></i>Description</div>
                    <div className="item-body">Order Receipt: #NNNNNNNN</div>
                </div>

                <div className="summary-item">
                    <div className="item-head"><i className="bi bi-clock" aria-hidden="true"></i>Pay before</div>
                    <div className="item-body">{formattedDate} at 12:00 PM</div>
                </div>

                <div className="total">
                    <div className="total-label">Total Amount Due</div>
                    <div className="total-amount">PHP 000.00</div>
                </div>
            </aside>
        </div>
    </main>
)
}
