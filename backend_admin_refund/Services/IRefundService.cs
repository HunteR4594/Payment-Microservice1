using backend_admin_refund.Models;

namespace backend_admin_refund.Services;

public interface IRefundService
{
    Task<List<RefundRequest>> GetAllRefundsAsync();
    Task<RefundRequest?> GetRefundByIdAsync(Guid id);
    Task<List<RefundRequest>> GetRefundsByStatusAsync(RefundStatus status);
    Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto);
    Task<RefundRequest?> ReviewRefundAsync(Guid id, ReviewRefundDto dto);
    Task<bool> ContactCustomerAsync(ContactCustomerDto dto);
    Task<RefundStats> GetRefundStatsAsync();
}

public class RefundStats
{
    public int TotalRequests { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public decimal TotalRefundedAmount { get; set; }
}
