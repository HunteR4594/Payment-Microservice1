import React from 'react'
import '../components/VoucherPopup.css'
import './VoucherPage.css'

export default function VoucherPage() {
  return (
    <div className="vp-page">
      <div className="vp-vignette" aria-hidden />

      <div className="vp-sheet">
        <header className="vp-sheet-header">
          <button className="back-button" onClick={() => setIsOpen(false)} aria-label="Back">
            <span className="back-icon">{'<'}</span>
          </button> 
        
          <h2 className="vp-title">Voucher history</h2>
        </header> 

        <section className="vp-top">
          <div className="vp-top-row">
            <div className="order-row">
            <div className="order-icon"><i className="bi bi-receipt" aria-hidden="true" ></i></div>
              <div className="text-group">
                <p className="primary-text">Order [date]</p>
                <p className="secondary-text">[Order Location]</p>
              </div>
            </div>

            <div className="voucher-banner">
              <div className="banner-icon"><i class="bi bi-cup-hot-fill"></i></div>
              <div className="banner-info">
                <p className="voucher-name">[voucher name]</p>
                <p className="voucher-sub">Min. Spend of [amount]</p>
              </div>
            </div>
          </div>

          <hr className="vp-sep" />
        </section>

        <div className="vp-spacer" />
      </div>
    </div>
  )
}
