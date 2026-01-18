CREATE PROCEDURE SP_CheckEmailExists @Email NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS(SELECT 1 FROM Customers WHERE Email = @Email)
       OR EXISTS(SELECT 1 FROM Admins WHERE Email = @Email)
       OR EXISTS(SELECT 1 FROM Riders WHERE Email = @Email)
        SELECT CAST(1 AS BIT);
    ELSE
        SELECT CAST(0 AS BIT);
END
GO

CREATE PROCEDURE SP_LoginUser @Email NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    -- Return the first matching user from Customers, Admins, or Riders
    SELECT TOP 1 Id, Email, FullName, PasswordHash, Role FROM Customers WHERE Email = @Email
    UNION ALL
    SELECT TOP 1 Id, Email, FullName, PasswordHash, Role FROM Admins WHERE Email = @Email
    UNION ALL
    SELECT TOP 1 Id, Email, FullName, PasswordHash, Role FROM Riders WHERE Email = @Email;
END
GO

CREATE PROCEDURE SP_RegisterCustomer
    @FullName NVARCHAR(MAX),
    @Email NVARCHAR(450),
    @PasswordHash NVARCHAR(MAX),
    @PhoneNumber NVARCHAR(MAX) = NULL,
    @Address NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO Customers (Id, PhoneNumber, Address, FullName, Email, PasswordHash, Role, CreatedAt, IsActive)
    VALUES (@Id, ISNULL(@PhoneNumber, ''), ISNULL(@Address, ''), ISNULL(@FullName, ''), @Email, @PasswordHash, 4, SYSUTCDATETIME(), 1);

    SELECT Id, Email, FullName, Role FROM Customers WHERE Id = @Id;
END
GO

CREATE PROCEDURE SP_CreateAdmin
    @FullName NVARCHAR(MAX),
    @Email NVARCHAR(450),
    @PasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Id UNIQUEIDENTIFIER = NEWID();

    -- Role = 2 corresponds to Admin
    INSERT INTO Admins (Id, FullName, Email, PasswordHash, Role, CreatedAt, IsActive)
    VALUES (@Id, ISNULL(@FullName, ''), @Email, @PasswordHash, 2, SYSUTCDATETIME(), 1);

    SELECT Id, Email, FullName, Role FROM Admins WHERE Id = @Id;
END
GO
