using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrderService.Data;
using OrderService.Services;

namespace OrderService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderFeedbackController : ControllerBase
    {
        private readonly OrderDbContext _db;
        private readonly OrderFeedbackService _orderFeedbackService;

        public OrderFeedbackController(OrderDbContext db)
        {
            _db = db;
            _orderFeedbackService = new OrderFeedbackService(db);
        }

        // Create Order Feedbacks
        [HttpPost("feedback")]
        public async Task<IActionResult> CreateOrderFeedback(
            int orderID,
            int userID,
            int rating,
            string? comment
            )
        {
            try
            {

                var feedback = await _orderFeedbackService.CreateFeedback(orderID, userID, rating, comment);

                return Ok(feedback);

            } catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        // View the Unread Order Feedback
        [HttpGet("admin/feedback/unread")]
        public async Task<IActionResult> ViewUnreadOrderFeedbacks()
        {
            var feedbacks = await _orderFeedbackService.GetUnreadFeedback();
            
            if (feedbacks == null)
            {
                var message = "Order Feedback is either Null or Database Error.";
                return BadRequest(new {message = message});
            }

            return Ok(feedbacks);
        }

        // Mark the Order Feedback as Read
        [HttpPut("{feedbackID}/read")]
        public async Task<IActionResult> MarkOrderFeedback(
            [FromRoute] int feedbackID
            )
        {
            try
            {

                var markedFeedback = await _orderFeedbackService.MarkAsRead(feedbackID);

                return Ok(markedFeedback);

            } catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
