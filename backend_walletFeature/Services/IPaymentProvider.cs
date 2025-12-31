namespace PaymentApi.Services;

/// <summary>
/// Interface for payment providers (PayMongo, Mock, etc.)
/// Allows switching between real and mock payment processing
/// </summary>
public interface IPaymentProvider
{
    /// <summary>
    /// Creates a payment link for the specified amount
    /// </summary>
    Task<CreatePaymentLinkResponse> CreatePaymentLinkAsync(decimal amount, string description, string referenceId);
    
    /// <summary>
    /// Gets the status of a payment intent
    /// </summary>
    Task<PaymentIntentResponse> GetPaymentIntentAsync(string paymentIntentId);
    
    /// <summary>
    /// Name of the payment provider (for logging)
    /// </summary>
    string ProviderName { get; }
}
