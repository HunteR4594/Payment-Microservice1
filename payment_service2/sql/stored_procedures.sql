-- =====================================================
-- Payment Service 2 - Stored Procedures
-- Database: PaymentService2
-- =====================================================

-- Create database if not exists (run separately if needed)
-- CREATE DATABASE PaymentService2;
-- GO
-- USE PaymentService2;
-- GO

-- =====================================================
-- TABLES
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wallets')
BEGIN
    CREATE TABLE Wallets (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId NVARCHAR(100) NOT NULL UNIQUE,
        Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
        Coins INT NOT NULL DEFAULT 0,
        LastUpdated DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transactions')
BEGIN
    CREATE TABLE Transactions (
        Id NVARCHAR(50) PRIMARY KEY,
        UserId NVARCHAR(100) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Description NVARCHAR(500),
        ReferenceId NVARCHAR(100),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        Id NVARCHAR(50) PRIMARY KEY,
        UserId NVARCHAR(100) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        PaymentMethod NVARCHAR(50),
        PaymentStatus NVARCHAR(50) DEFAULT 'pending',
        VoucherCode NVARCHAR(50),
        VoucherDiscount DECIMAL(18,2) DEFAULT 0,
        CoinsUsed INT DEFAULT 0,
        CoinsDiscount DECIMAL(18,2) DEFAULT 0,
        FinalAmount DECIMAL(18,2) NOT NULL,
        Branch NVARCHAR(200),
        PaymentUrl NVARCHAR(MAX),
        PaymentLinkId NVARCHAR(100),
        CheckoutSessionId NVARCHAR(100),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CompletedAt DATETIME2
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE OrderItems (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        OrderId NVARCHAR(50) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Quantity INT NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        FOREIGN KEY (OrderId) REFERENCES Orders(Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TopUps')
BEGIN
    CREATE TABLE TopUps (
        Id NVARCHAR(50) PRIMARY KEY,
        UserId NVARCHAR(100) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        PaymentMethod NVARCHAR(50),
        PaymentUrl NVARCHAR(500),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CompletedAt DATETIME2
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vouchers')
BEGIN
    CREATE TABLE Vouchers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(500),
        DiscountType NVARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
        DiscountValue DECIMAL(18,2) NOT NULL,
        MinOrderAmount DECIMAL(18,2) DEFAULT 0,
        MaxDiscount DECIMAL(18,2),
        UsageLimit INT,
        UsedCount INT DEFAULT 0,
        ExpiresAt DATETIME2,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Refunds')
BEGIN
    CREATE TABLE Refunds (
        Id NVARCHAR(50) PRIMARY KEY,
        UserId NVARCHAR(100) NOT NULL,
        OrderId NVARCHAR(50),
        Amount DECIMAL(18,2) NOT NULL,
        Reason NVARCHAR(1000),
        Category NVARCHAR(100),
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        CustomerName NVARCHAR(200),
        CustomerEmail NVARCHAR(200),
        CustomerPhone NVARCHAR(50),
        AdminNotes NVARCHAR(1000),
        RejectionReason NVARCHAR(500),
        ReviewedBy NVARCHAR(100),
        WalletCredited BIT DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ReviewedAt DATETIME2
    );
END
GO

-- =====================================================
-- WALLET STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE SP_GetWallet
    @UserId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if wallet exists
    IF NOT EXISTS (SELECT 1 FROM Wallets WHERE UserId = @UserId)
    BEGIN
        -- Create wallet if not exists
        INSERT INTO Wallets (UserId, Balance, Coins, LastUpdated)
        VALUES (@UserId, 0, 0, SYSUTCDATETIME());
    END
    
    SELECT Id, UserId, Balance, Coins, LastUpdated
    FROM Wallets
    WHERE UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE SP_AddBalance
    @UserId NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @ReferenceId NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL,
    @TransactionType NVARCHAR(50) = 'topup',
    @ReturnRecord BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    -- Ensure wallet exists
    IF NOT EXISTS (SELECT 1 FROM Wallets WHERE UserId = @UserId)
    BEGIN
        INSERT INTO Wallets (UserId, Balance, Coins, LastUpdated)
        VALUES (@UserId, 0, 0, SYSUTCDATETIME());
    END
    
    -- Calculate coins earned (5 coins per 100 currency)
    DECLARE @CoinsEarned INT = FLOOR(@Amount / 100) * 5;
    
    -- Update wallet
    UPDATE Wallets
    SET Balance = Balance + @Amount,
        Coins = Coins + @CoinsEarned,
        LastUpdated = SYSUTCDATETIME()
    WHERE UserId = @UserId;
    
    -- Record transaction
    DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
    DECLARE @ActualDesc NVARCHAR(500) = ISNULL(@Description, CASE WHEN @TransactionType = 'refund' THEN 'Refund for Order' ELSE 'Wallet Top-up' END);
    
    INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
    VALUES (@TxnId, @UserId, @TransactionType, @Amount, @ActualDesc, @ReferenceId, SYSUTCDATETIME());
    
    -- Record coins transaction if earned
    IF @CoinsEarned > 0
    BEGIN
        DECLARE @CoinsTxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
        INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
        VALUES (@CoinsTxnId, @UserId, 'coins', @CoinsEarned, 'Coins earned from top-up', @ReferenceId, SYSUTCDATETIME());
    END
    
    COMMIT;
    
    -- Return updated wallet if requested
    IF @ReturnRecord = 1
    BEGIN
        SELECT Id, UserId, Balance, Coins, LastUpdated
        FROM Wallets
        WHERE UserId = @UserId;
    END
END
GO

CREATE OR ALTER PROCEDURE SP_DeductBalance
    @UserId NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @ReferenceId NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check balance
    DECLARE @CurrentBalance DECIMAL(18,2);
    SELECT @CurrentBalance = Balance FROM Wallets WHERE UserId = @UserId;
    
    IF @CurrentBalance IS NULL OR @CurrentBalance < @Amount
    BEGIN
        RAISERROR('Insufficient balance', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Deduct balance
    UPDATE Wallets
    SET Balance = Balance - @Amount,
        LastUpdated = SYSUTCDATETIME()
    WHERE UserId = @UserId;
    
    -- Record transaction
    DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
    INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
    VALUES (@TxnId, @UserId, 'order', -@Amount, ISNULL(@Description, 'Order Payment'), @ReferenceId, SYSUTCDATETIME());
    
    COMMIT;
    
    -- Return updated wallet
    SELECT Id, UserId, Balance, Coins, LastUpdated
    FROM Wallets
    WHERE UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE SP_UseCoins
    @UserId NVARCHAR(100),
    @CoinsToUse INT,
    @ReferenceId NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @CoinsToUse <= 0
    BEGIN
        SELECT Id, UserId, Balance, Coins, LastUpdated
        FROM Wallets
        WHERE UserId = @UserId;
        RETURN;
    END
    
    -- Check coins
    DECLARE @CurrentCoins INT;
    SELECT @CurrentCoins = Coins FROM Wallets WHERE UserId = @UserId;
    
    IF @CurrentCoins IS NULL OR @CurrentCoins < @CoinsToUse
    BEGIN
        RAISERROR('Insufficient coins', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Deduct coins
    UPDATE Wallets
    SET Coins = Coins - @CoinsToUse,
        LastUpdated = SYSUTCDATETIME()
    WHERE UserId = @UserId;
    
    -- Record transaction
    DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
    INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
    VALUES (@TxnId, @UserId, 'coins', -@CoinsToUse, ISNULL(@Description, 'Coins used'), @ReferenceId, SYSUTCDATETIME());
    
    COMMIT;
    
    -- Return updated wallet
    SELECT Id, UserId, Balance, Coins, LastUpdated
    FROM Wallets
    WHERE UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE SP_GetTransactions
    @UserId NVARCHAR(100),
    @Limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Limit) Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt
    FROM Transactions
    WHERE UserId = @UserId
    ORDER BY CreatedAt DESC;
END
GO

-- =====================================================
-- ORDER STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE SP_CreateOrder
    @UserId NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @PaymentMethod NVARCHAR(50),
    @VoucherCode NVARCHAR(50) = NULL,
    @VoucherDiscount DECIMAL(18,2) = 0,
    @CoinsUsed INT = 0,
    @CoinsDiscount DECIMAL(18,2) = 0,
    @Branch NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OrderId NVARCHAR(50) = 'ord_' + REPLACE(NEWID(), '-', '');
    DECLARE @FinalAmount DECIMAL(18,2) = @Amount - @VoucherDiscount - @CoinsDiscount;
    
    INSERT INTO Orders (Id, UserId, Amount, Status, PaymentMethod, PaymentStatus, 
                        VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount, 
                        FinalAmount, Branch, CreatedAt)
    VALUES (@OrderId, @UserId, @Amount, 'pending', @PaymentMethod, 'pending',
            @VoucherCode, @VoucherDiscount, @CoinsUsed, @CoinsDiscount,
            @FinalAmount, @Branch, SYSUTCDATETIME());
    
    SELECT @OrderId AS OrderId;
END
GO

CREATE OR ALTER PROCEDURE SP_AddOrderItem
    @OrderId NVARCHAR(50),
    @Name NVARCHAR(200),
    @Quantity INT,
    @Price DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO OrderItems (OrderId, Name, Quantity, Price)
    VALUES (@OrderId, @Name, @Quantity, @Price);
END
GO

CREATE OR ALTER PROCEDURE SP_GetOrder
    @OrderId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentStatus,
           VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount,
           FinalAmount, Branch, PaymentUrl, PaymentLinkId, CheckoutSessionId,
           CreatedAt, CompletedAt
    FROM Orders
    WHERE Id = @OrderId;
    
    SELECT Id, OrderId, Name, Quantity, Price
    FROM OrderItems
    WHERE OrderId = @OrderId;
END
GO

CREATE OR ALTER PROCEDURE SP_GetOrderItems
    @OrderId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, OrderId, Name, Quantity, Price
    FROM OrderItems
    WHERE OrderId = @OrderId;
END
GO

CREATE OR ALTER PROCEDURE SP_GetOrdersByUser
    @UserId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentStatus,
           VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount,
           FinalAmount, Branch, PaymentUrl, PaymentLinkId, CheckoutSessionId,
           CreatedAt, CompletedAt
    FROM Orders
    WHERE UserId = @UserId
    ORDER BY CreatedAt DESC;
END
GO

CREATE OR ALTER PROCEDURE SP_CompleteOrder
    @OrderId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get order details for logging if not already logged
    DECLARE @UserId NVARCHAR(100), @Amount DECIMAL(18,2), @PaymentMethod NVARCHAR(50), @Status NVARCHAR(50);
    SELECT @UserId = UserId, @Amount = FinalAmount, @PaymentMethod = PaymentMethod, @Status = Status
    FROM Orders WHERE Id = @OrderId;

    IF @Status = 'completed' RETURN; -- Already completed

    BEGIN TRANSACTION;

    UPDATE Orders
    SET Status = 'completed',
        PaymentStatus = 'completed',
        CompletedAt = SYSUTCDATETIME()
    WHERE Id = @OrderId;

    -- If not wallet payment, log the order transaction (Wallet already logs during deduction)
    IF @PaymentMethod != 'wallet'
    BEGIN
        DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
        INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
        VALUES (@TxnId, @UserId, 'order', -@Amount, 'Order - External Payment', @OrderId, SYSUTCDATETIME());
    END
    
    COMMIT;

    SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentStatus,
           FinalAmount, CreatedAt, CompletedAt
    FROM Orders
    WHERE Id = @OrderId;
END
GO

CREATE OR ALTER PROCEDURE SP_UpdateOrderPaymentData
    @OrderId NVARCHAR(50),
    @PaymentUrl NVARCHAR(MAX) = NULL,
    @PaymentLinkId NVARCHAR(100) = NULL,
    @CheckoutSessionId NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Orders
    SET PaymentUrl = @PaymentUrl,
        PaymentLinkId = @PaymentLinkId,
        CheckoutSessionId = @CheckoutSessionId
    WHERE Id = @OrderId;
END
GO

-- =====================================================
-- TOPUP STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE SP_CreateTopUp
    @UserId NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @PaymentMethod NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TopUpId NVARCHAR(50) = 'top_' + REPLACE(NEWID(), '-', '');
    
    INSERT INTO TopUps (Id, UserId, Amount, Status, PaymentMethod, CreatedAt)
    VALUES (@TopUpId, @UserId, @Amount, 'pending', @PaymentMethod, SYSUTCDATETIME());
    
    SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentUrl, CreatedAt
    FROM TopUps
    WHERE Id = @TopUpId;
END
GO

CREATE OR ALTER PROCEDURE SP_GetTopUp
    @TopUpId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentUrl, CreatedAt, CompletedAt
    FROM TopUps
    WHERE Id = @TopUpId;
END
GO

CREATE OR ALTER PROCEDURE SP_UpdateTopUpPaymentUrl
    @TopUpId NVARCHAR(50),
    @PaymentUrl NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE TopUps
    SET PaymentUrl = @PaymentUrl
    WHERE Id = @TopUpId;
END
GO

CREATE OR ALTER PROCEDURE SP_CompleteTopUp
    @TopUpId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId NVARCHAR(100);
    DECLARE @Amount DECIMAL(18,2);
    
    SELECT @UserId = UserId, @Amount = Amount
    FROM TopUps
    WHERE Id = @TopUpId AND Status = 'pending';
    
    IF @UserId IS NULL
    BEGIN
        RAISERROR('TopUp not found or already processed', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Update top-up status
    UPDATE TopUps
    SET Status = 'completed',
        CompletedAt = SYSUTCDATETIME()
    WHERE Id = @TopUpId;
    
    -- Add balance to wallet
    EXEC SP_AddBalance @UserId, @Amount, @TopUpId, 'Wallet Top-up', 'topup';
    
    COMMIT;
    
    SELECT Id, UserId, Amount, Status, PaymentMethod, CreatedAt, CompletedAt
    FROM TopUps
    WHERE Id = @TopUpId;
END
GO

-- =====================================================
-- VOUCHER STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE SP_GetVouchers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, Code, Description, DiscountType, DiscountValue,
           MinOrderAmount, MaxDiscount, UsageLimit, UsedCount,
           ExpiresAt, IsActive, CreatedAt
    FROM Vouchers
    WHERE IsActive = 1 AND (ExpiresAt IS NULL OR ExpiresAt > SYSUTCDATETIME());
END
GO

CREATE OR ALTER PROCEDURE SP_ApplyVoucher
    @Code NVARCHAR(50),
    @OrderTotal DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @VoucherId INT, @DiscountType NVARCHAR(20), @DiscountValue DECIMAL(18,2);
    DECLARE @MinOrderAmount DECIMAL(18,2), @MaxDiscount DECIMAL(18,2);
    DECLARE @UsageLimit INT, @UsedCount INT, @ExpiresAt DATETIME2, @IsActive BIT;
    
    SELECT @VoucherId = Id, @DiscountType = DiscountType, @DiscountValue = DiscountValue,
           @MinOrderAmount = MinOrderAmount, @MaxDiscount = MaxDiscount,
           @UsageLimit = UsageLimit, @UsedCount = UsedCount, @ExpiresAt = ExpiresAt, @IsActive = IsActive
    FROM Vouchers
    WHERE Code = @Code;
    
    IF @VoucherId IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS Success, 'Voucher not found' AS Message, CAST(0 AS DECIMAL(18,2)) AS Discount;
        RETURN;
    END
    
    IF @IsActive = 0
    BEGIN
        SELECT CAST(0 AS BIT) AS Success, 'Voucher is inactive' AS Message, CAST(0 AS DECIMAL(18,2)) AS Discount;
        RETURN;
    END
    
    IF @ExpiresAt IS NOT NULL AND @ExpiresAt < SYSUTCDATETIME()
    BEGIN
        SELECT CAST(0 AS BIT) AS Success, 'Voucher has expired' AS Message, CAST(0 AS DECIMAL(18,2)) AS Discount;
        RETURN;
    END
    
    IF @UsageLimit IS NOT NULL AND @UsedCount >= @UsageLimit
    BEGIN
        SELECT CAST(0 AS BIT) AS Success, 'Voucher usage limit reached' AS Message, CAST(0 AS DECIMAL(18,2)) AS Discount;
        RETURN;
    END
    
    IF @OrderTotal < @MinOrderAmount
    BEGIN
        SELECT CAST(0 AS BIT) AS Success, 'Order total below minimum' AS Message, CAST(0 AS DECIMAL(18,2)) AS Discount;
        RETURN;
    END
    
    -- Calculate discount
    DECLARE @Discount DECIMAL(18,2);
    IF @DiscountType = 'percentage'
        SET @Discount = @OrderTotal * @DiscountValue / 100;
    ELSE
        SET @Discount = @DiscountValue;
    
    -- Apply max discount cap
    IF @MaxDiscount IS NOT NULL AND @Discount > @MaxDiscount
        SET @Discount = @MaxDiscount;
    
    -- Update usage count
    UPDATE Vouchers SET UsedCount = UsedCount + 1 WHERE Id = @VoucherId;
    
    SELECT CAST(1 AS BIT) AS Success, 'Voucher applied' AS Message, @Discount AS Discount;
END
GO

-- =====================================================
-- REFUND STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE SP_CreateRefund
    @UserId NVARCHAR(100),
    @OrderId NVARCHAR(50) = NULL,
    @Amount DECIMAL(18,2) = 0,
    @Reason NVARCHAR(1000) = NULL,
    @Category NVARCHAR(100) = NULL,
    @CustomerName NVARCHAR(200) = NULL,
    @CustomerEmail NVARCHAR(200) = NULL,
    @CustomerPhone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- If OrderId is provided and Amount is 0 or not provided, fetch FinalAmount from Orders
    IF @OrderId IS NOT NULL AND (@Amount IS NULL OR @Amount = 0)
    BEGIN
        SELECT @Amount = FinalAmount FROM Orders WHERE Id = @OrderId;
    END

    DECLARE @RefundId NVARCHAR(50) = 'ref_' + REPLACE(NEWID(), '-', '');
    
    INSERT INTO Refunds (Id, UserId, OrderId, Amount, Reason, Category, Status,
                         CustomerName, CustomerEmail, CustomerPhone, CreatedAt)
    VALUES (@RefundId, @UserId, @OrderId, @Amount, @Reason, @Category, 'pending',
            @CustomerName, @CustomerEmail, @CustomerPhone, SYSUTCDATETIME());
    
    SELECT Id, UserId, OrderId, Amount, Reason, Category, Status,
           CustomerName, CustomerEmail, CustomerPhone, CreatedAt
    FROM Refunds
    WHERE Id = @RefundId;
END
GO

CREATE OR ALTER PROCEDURE SP_GetRefunds
    @UserId NVARCHAR(100) = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT r.Id, r.UserId, r.OrderId, r.Amount, r.Reason, r.Category, r.Status,
           r.CustomerName, r.CustomerEmail, r.CustomerPhone, r.AdminNotes,
           r.RejectionReason, r.ReviewedBy, r.WalletCredited, r.CreatedAt, r.ReviewedAt,
           o.VoucherCode, o.VoucherDiscount
    FROM Refunds r
    LEFT JOIN Orders o ON r.OrderId = o.Id
    WHERE (@UserId IS NULL OR r.UserId = @UserId)
      AND (@Status IS NULL OR r.Status = @Status)
    ORDER BY r.CreatedAt DESC;
END
GO

CREATE OR ALTER PROCEDURE SP_ReviewRefund
    @RefundId NVARCHAR(50),
    @Action NVARCHAR(20), -- 'approve' or 'reject'
    @AdminNotes NVARCHAR(1000) = NULL,
    @RejectionReason NVARCHAR(500) = NULL,
    @ReviewedBy NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NewStatus NVARCHAR(50);
    IF @Action = 'approve'
        SET @NewStatus = 'approved';
    ELSE
        SET @NewStatus = 'rejected';
    
    UPDATE Refunds
    SET Status = @NewStatus,
        AdminNotes = @AdminNotes,
        RejectionReason = @RejectionReason,
        ReviewedBy = @ReviewedBy,
        ReviewedAt = SYSUTCDATETIME()
    WHERE Id = @RefundId;
    
    SELECT Id, UserId, OrderId, Amount, Status, AdminNotes, RejectionReason,
           ReviewedBy, WalletCredited, ReviewedAt
    FROM Refunds
    WHERE Id = @RefundId;
END
GO

CREATE OR ALTER PROCEDURE SP_ProcessRefundToWallet
    @RefundId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId NVARCHAR(100), @Amount DECIMAL(18,2), @Status NVARCHAR(50), @WalletCredited BIT, @OrderId NVARCHAR(50);
    
    SELECT @UserId = UserId, @Amount = Amount, @Status = Status, @WalletCredited = WalletCredited, @OrderId = OrderId
    FROM Refunds
    WHERE Id = @RefundId;
    
    IF @Status != 'approved'
    BEGIN
        RAISERROR('Refund must be approved first', 16, 1);
        RETURN;
    END
    
    IF @WalletCredited = 1
    BEGIN
        RAISERROR('Refund already credited to wallet', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    DECLARE @RefundDesc NVARCHAR(500) = 'Refund for Order ' + ISNULL(@OrderId, '');

    -- Credit wallet
    EXEC SP_AddBalance @UserId, @Amount, @RefundId, @RefundDesc, 'refund', 0;
    
    -- Mark as credited
    UPDATE Refunds
    SET WalletCredited = 1,
        Status = 'completed'
    WHERE Id = @RefundId;
    
    COMMIT;
    
    SELECT Id, UserId, Amount, Status, WalletCredited
    FROM Refunds
    WHERE Id = @RefundId;
END
GO

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed some vouchers
IF NOT EXISTS (SELECT 1 FROM Vouchers WHERE Code = 'WELCOME10')
BEGIN
    INSERT INTO Vouchers (Code, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, IsActive)
    VALUES 
        ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 100, 50, 1),
        ('FLAT50', 'Flat 50 off on orders above 500', 'fixed', 50, 500, NULL, 1),
        ('SAVE20', '20% off up to 100 discount', 'percentage', 20, 200, 100, 1);
END
GO

PRINT 'Payment Service 2 - Stored Procedures created successfully!';
GO

USE PaymentServiceDB;
GO

-- 0. Add missing UpdatedAt column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'UpdatedAt')
BEGIN
    ALTER TABLE Orders ADD UpdatedAt DATETIME2 NULL;
END
GO

-- 1. SP_UpdateOrder
-- Updates order details after payment initiation/completion
CREATE OR ALTER PROCEDURE SP_UpdateOrder
    @OrderId NVARCHAR(50),
    @PaymentMethod NVARCHAR(50),
    @VoucherCode NVARCHAR(50) = NULL,
    @VoucherDiscount DECIMAL(18,2) = 0,
    @CoinsDiscount DECIMAL(18,2) = 0,
    @FinalAmount DECIMAL(18,2),
    @Status NVARCHAR(50),
    @PaymentUrl NVARCHAR(500) = NULL,
    @PaymentLinkId NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Orders
    SET PaymentMethod = @PaymentMethod,
        VoucherCode = @VoucherCode,
        VoucherDiscount = @VoucherDiscount,
        CoinsDiscount = @CoinsDiscount,
        FinalAmount = @FinalAmount,
        Status = @Status,
        PaymentUrl = @PaymentUrl,
        PaymentLinkId = @PaymentLinkId,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @OrderId;
END
GO

-- 2. SP_CompleteOrder
-- Marks order as completed
CREATE OR ALTER PROCEDURE SP_CompleteOrder
    @OrderId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Orders
    SET Status = 'completed',
        PaymentStatus = 'paid',
        CompletedAt = SYSUTCDATETIME(),
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @OrderId;
END
GO

-- 3. SP_DeductBalance
-- Deducts amount from wallet and logs transaction
CREATE OR ALTER PROCEDURE SP_DeductBalance
    @UserId NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @ReferenceId NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    -- Check balance
    DECLARE @CurrentBalance DECIMAL(18,2);
    SELECT @CurrentBalance = Balance FROM Wallets WHERE UserId = @UserId;
    
    IF @CurrentBalance IS NULL OR @CurrentBalance < @Amount
    BEGIN
        ROLLBACK;
        THROW 50001, 'Insufficient wallet balance', 1;
        RETURN;
    END
    
    -- Deduct balance
    UPDATE Wallets
    SET Balance = Balance - @Amount,
        LastUpdated = SYSUTCDATETIME()
    WHERE UserId = @UserId;
    
    -- Log transaction
    DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
    INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
    VALUES (@TxnId, @UserId, 'payment', -@Amount, ISNULL(@Description, 'Payment'), @ReferenceId, SYSUTCDATETIME());
    
    COMMIT;
    
    SELECT Id, UserId, Balance, Coins, LastUpdated FROM Wallets WHERE UserId = @UserId;
END
GO

-- 4. SP_UseCoins
-- Deducts coins from wallet
CREATE OR ALTER PROCEDURE SP_UseCoins
    @UserId NVARCHAR(100),
    @CoinsToUse INT,
    @ReferenceId NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @CurrentCoins INT;
    SELECT @CurrentCoins = Coins FROM Wallets WHERE UserId = @UserId;
    
    IF @CurrentCoins IS NULL OR @CurrentCoins < @CoinsToUse
    BEGIN
        ROLLBACK;
        THROW 50002, 'Insufficient coins', 1;
        RETURN;
    END
    
    -- Deduct coins
    UPDATE Wallets
    SET Coins = Coins - @CoinsToUse,
        LastUpdated = SYSUTCDATETIME()
    WHERE UserId = @UserId;
    
    -- Log transaction
    DECLARE @TxnId NVARCHAR(50) = 'txn_' + REPLACE(NEWID(), '-', '');
    INSERT INTO Transactions (Id, UserId, Type, Amount, Description, ReferenceId, CreatedAt)
    VALUES (@TxnId, @UserId, 'redemption', 0, ISNULL(@Description, 'Coins used'), @ReferenceId, SYSUTCDATETIME());
    
    COMMIT;
    
    SELECT Id, UserId, Balance, Coins, LastUpdated FROM Wallets WHERE UserId = @UserId;
END
GO

-- 5. SP_UpdateOrderPaymentData
CREATE OR ALTER PROCEDURE SP_UpdateOrderPaymentData
    @OrderId NVARCHAR(50),
    @PaymentUrl NVARCHAR(500) = NULL,
    @PaymentLinkId NVARCHAR(100) = NULL,
    @CheckoutSessionId NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Orders
    SET PaymentUrl = @PaymentUrl,
        PaymentLinkId = @PaymentLinkId,
        CheckoutSessionId = @CheckoutSessionId,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @OrderId;
END
GO

-- 6. SP_UpdateVoucherUsage
CREATE OR ALTER PROCEDURE SP_UpdateVoucherUsage
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Vouchers SET UsedCount = UsedCount + 1 WHERE Code = @Code;
END
GO