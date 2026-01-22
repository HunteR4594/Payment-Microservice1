using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.OpenApi.Models;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Services
{
    public class OrderFeedbackService
    {
        private readonly OrderDbContext _db;

        public OrderFeedbackService(OrderDbContext db)
        {
            _db = db;
        }

        // Customer
        public async Task<OrderFeedback> CreateFeedback(
            int orderID,
            int userID,
            int rating,
            string? comment
            )
        {
            // Get the Order through OrderID and userID
            var order = await _db.Orders
                .FirstOrDefaultAsync(o => o.orders_id == orderID && o.users_id == userID);

            if ( order == null ) 
            { 
                throw new Exception("Order or User does not exist."); 
            }

            // Check the order status
            // 5 = Delivered
            if (order.status != 5)
            {
                throw new Exception("Feedback is only allowed for delivered orders.");
            }

            // Check if the feedback already exists.
            var existingFeedback = await _db.OrderFeedback
                .FirstOrDefaultAsync(f => f.orders_id == orderID);

            if ( existingFeedback != null )
            {
                throw new Exception("The feedback on this order is already submitted.");
            }

            // Validate rating
            if (rating < 1 || rating > 5)
            {
                throw new Exception("Rating is not valid, it must be between 1 to 5.");
            }

            // Create Feedback
            var feedback = new OrderFeedback
            {
                orders_id = orderID,
                rating = rating,
                comment = string.IsNullOrEmpty(comment) ? "No Comment." : comment,
                created_at = DateTime.Now,
                is_read = false
            };

            // Add the Feedback to the Database and Save Changes.
            _db.OrderFeedback.Add(feedback);
            await _db.SaveChangesAsync();


            return feedback;
        }


        // Admin

        // View Unread Order Feedbacks
        public async Task<List<OrderFeedback>> GetUnreadFeedback()
        {
            return await _db.OrderFeedback
                .Where(f => !f.is_read)
                .OrderByDescending(f => f.created_at)
                .ToListAsync();
        }

        // Mark Order Feedback as Read
        public async Task<OrderFeedback> MarkAsRead(int feedbackID)
        {
            // Find the Feedback
            var feedback = await _db.OrderFeedback
                .FindAsync(feedbackID);

            if (feedback == null)
            {
                throw new Exception("Feedback is not found.");
            }

            // Mark the feedback is read bool
            feedback.is_read = true;

            // Save changes
            await _db.SaveChangesAsync();

            // Return the feedback
            return feedback;
        }





    }
}
