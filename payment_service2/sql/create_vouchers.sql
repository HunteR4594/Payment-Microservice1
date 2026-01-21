-- Create trustworthy vouchers
USE PaymentServiceDB;
GO

-- 1. TEST100: Flat 100 off, No Minimum
IF NOT EXISTS (SELECT 1 FROM Vouchers WHERE Code = 'TEST100')
BEGIN
    INSERT INTO Vouchers (Code, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, IsActive, CreatedAt)
    VALUES ('TEST100', 'Test Voucher 100 Off', 'fixed', 100, 0, NULL, 1, SYSUTCDATETIME());
END

-- 2. SAVE100: 100 Off, Min 500
IF NOT EXISTS (SELECT 1 FROM Vouchers WHERE Code = 'SAVE100')
BEGIN
    INSERT INTO Vouchers (Code, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, IsActive, CreatedAt)
    VALUES ('SAVE100', 'Save 100 on 500+', 'fixed', 100, 500, NULL, 1, SYSUTCDATETIME());
END

-- 3. PERCENT10: 10% Off, No Minimum
IF NOT EXISTS (SELECT 1 FROM Vouchers WHERE Code = 'PERCENT10')
BEGIN
    INSERT INTO Vouchers (Code, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, IsActive, CreatedAt)
    VALUES ('PERCENT10', '10% Off Everything', 'percentage', 10, 0, 500, 1, SYSUTCDATETIME());
END

-- 4. UPDATE EXISTING to be sure
UPDATE Vouchers SET IsActive = 1, MinOrderAmount = 0 WHERE Code = 'WELCOME10';
UPDATE Vouchers SET IsActive = 1, MinOrderAmount = 200 WHERE Code = 'SAVE20';

SELECT Code, DiscountType, DiscountValue, MinOrderAmount, IsActive FROM Vouchers;
GO
