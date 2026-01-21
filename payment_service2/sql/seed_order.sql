-- Insert a test order (Coffee Shop) for user_001
DECLARE @OrderId NVARCHAR(50) = 'ord_coffee_' + REPLACE(NEWID(), '-', '');
DECLARE @UserId NVARCHAR(100) = 'user_001';

INSERT INTO Orders (Id, UserId, Amount, Status, PaymentMethod, PaymentStatus, FinalAmount, Branch, CreatedAt)
VALUES (@OrderId, @UserId, 440.00, 'pending', 'wallet', 'pending', 440.00, 'Kapebara Main', SYSUTCDATETIME());

INSERT INTO OrderItems (OrderId, Name, Quantity, Price)
VALUES 
(@OrderId, 'Caramel Macchiato', 2, 160.00), -- 320
(@OrderId, 'Ham & Cheese Croissant', 1, 120.00); -- 120

PRINT 'Coffee order created with ID: ' + @OrderId;
