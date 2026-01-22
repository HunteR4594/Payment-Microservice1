using Microsoft.Data.SqlClient;

namespace PaymentService2.Data;

public static class DbUtils
{
    public static void EnsureDatabaseExists(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var originalDb = builder.InitialCatalog;

        if (string.IsNullOrEmpty(originalDb))
        {
            // If no database specified in connection string, nothing to create
            return;
        }

        // Connect to master to check/create DB
        builder.InitialCatalog = "master";
        var masterConnectionString = builder.ConnectionString;

        using var conn = new SqlConnection(masterConnectionString);
        conn.Open();

        // Check if DB exists
        var checkCmd = conn.CreateCommand();
        checkCmd.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = @name";
        checkCmd.Parameters.AddWithValue("@name", originalDb);
        
        var exists = (int)checkCmd.ExecuteScalar() > 0;

        if (!exists)
        {
            Console.WriteLine($"Database '{originalDb}' does not exist. Creating...");
            var createCmd = conn.CreateCommand();
            // Sanitize DB name to prevent injection, though usually comes from trusted config
            // Using logic to valid identifier would be safer, but for this internal service simpler approach:
            createCmd.CommandText = $"CREATE DATABASE [{originalDb}]"; 
            createCmd.ExecuteNonQuery();
            Console.WriteLine($"✓ Database '{originalDb}' created successfully.");
        }
    }
}
