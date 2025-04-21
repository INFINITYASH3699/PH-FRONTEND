import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connect } from './config/database';
import Portfolio from './models/Portfolio';

// Load environment variables
dotenv.config();

const runMigration = async () => {
  try {
    console.log('Starting migration to remove compound index on userId and subdomain...');

    // Connect to the database
    await connect();

    // Get the collection
    const portfolioCollection = mongoose.connection.collection('portfolios');

    // Check if the index exists
    const indexes = await portfolioCollection.indexes();
    console.log('Current indexes:', indexes);

    // Look for the compound index
    const compoundIndexExists = indexes.some(index =>
      index.key && index.key.userId === 1 && index.key.subdomain === 1 && index.unique === true
    );

    if (compoundIndexExists) {
      console.log('Found the compound index, dropping it...');

      // Drop the compound index
      await portfolioCollection.dropIndex('userId_1_subdomain_1');

      console.log('Compound index successfully removed.');
    } else {
      console.log('Compound index not found, no changes needed.');
    }

    // Add the non-unique index on subdomain if it doesn't exist
    const subdomainIndexExists = indexes.some(index =>
      index.key && Object.keys(index.key).length === 1 && index.key.subdomain === 1
    );

    if (!subdomainIndexExists) {
      console.log('Creating non-unique index on subdomain...');
      await portfolioCollection.createIndex({ subdomain: 1 }, { unique: false });
      console.log('Non-unique subdomain index created.');
    } else {
      console.log('Subdomain index already exists.');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
