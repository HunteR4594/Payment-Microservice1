using System;
using System.Collections.Generic;
using backend_refund_page.Models;

namespace backend_refund_page.Services
{
    public class RefundService
    {
        private readonly List<Refund> _refunds = new List<Refund>();

        public IEnumerable<Refund> GetAll()
        {
            return _refunds;
        }

        public Refund GetById(Guid id)
        {
            return _refunds.Find(r => r.Id == id);
        }

        public Refund Create(Refund refund)
        {
            refund.Id = Guid.NewGuid();
            refund.CreatedAt = DateTime.UtcNow;
            refund.Status = "Pending";
            _refunds.Add(refund);
            return refund;
        }

        public bool UpdateStatus(Guid id, string status)
        {
            var refund = GetById(id);
            if (refund == null) return false;
            refund.Status = status;
            return true;
        }
    }
}