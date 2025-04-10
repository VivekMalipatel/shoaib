#!/bin/bash
# Run the database seeding script
echo "Running database seed script..."
tsx seed-database.ts "$@"

