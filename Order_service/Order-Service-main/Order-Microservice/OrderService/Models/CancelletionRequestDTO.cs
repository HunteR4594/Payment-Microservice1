using System.ComponentModel.DataAnnotations;

namespace OrderService.DTOs
{
    public class CancellationRequestDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "A reason is required to process cancellation.")]
        public string Reason { get; set; }
    }

    public class AdminReviewDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public bool Approve { get; set; } 
    }
}