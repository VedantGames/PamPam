require('dotenv').config();

const app = require('./src/app')

app.listen(8000, () => {
  console.log('Listening on http://localhost:8000');
})