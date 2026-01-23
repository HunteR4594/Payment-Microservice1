-- =====================================================
-- Migration 05: Voucher Stored Procedures
-- Payment Service 2
-- =====================================================

CREATE OR ALTER PROCEDURE SP_GetVouchers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT Id, Code, Description, DiscountType, DiscountValue,
           MinOrderAmount, MaxDiscount, UsageLimit, UsedCount,
           ExpiresAt, IsActive, CreatedAt
    FROM Vouchers
    WHERE IsActive = 1 AND (ExpiresAt IS NULL OR ExpiresAt > DATEADD(hour, 8, SYSUTCDATETIME()));
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
    
    IF @ExpiresAt IS NOT NULL AND @ExpiresAt < DATEADD(hour, 8, SYSUTCDATETIME())
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
    
    DECLARE @Discount DECIMAL(18,2);
    IF @DiscountType = 'percentage'
        SET @Discount = @OrderTotal * @DiscountValue / 100;
    ELSE
        SET @Discount = @DiscountValue;
    
    IF @MaxDiscount IS NOT NULL AND @Discount > @MaxDiscount
        SET @Discount = @MaxDiscount;
    
    -- Note: UsedCount is updated by SP_UpdateVoucherUsage after successful payment
    
    SELECT CAST(1 AS BIT) AS Success, 'Voucher applied' AS Message, @Discount AS Discount;
END
GO

CREATE OR ALTER PROCEDURE SP_UpdateVoucherUsage
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Vouchers
    SET UsedCount = UsedCount + 1
    WHERE Code = @Code AND IsActive = 1;
END
GO
