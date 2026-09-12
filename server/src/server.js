import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start the web server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
