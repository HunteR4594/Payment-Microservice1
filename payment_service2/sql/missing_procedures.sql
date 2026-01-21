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

-- 5. SP_UpdateOrderPaymentData (Also possibly missing based on investigation)
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
