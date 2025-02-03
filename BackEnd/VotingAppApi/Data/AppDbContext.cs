﻿
namespace VotingAppApi.Data
{
    using global::VotingAppApi.Models;
    using Microsoft.EntityFrameworkCore;
    

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Candidate> Candidates { get; set; }

        

    }

}
