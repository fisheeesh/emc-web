import 'dotenv/config';
import { app } from "./app";
import './jobs/workers/analysis-worker'
import './jobs/workers/image-worker'
import './jobs/workers/email-worker'
import './jobs/workers/recommendation-worker'
import './jobs/workers/score-worker'

const PORT = process.env.PORT || 4000

//* everything is middleware in express
app.listen(PORT, () => console.log(`Server ready at: http://localhost:${PORT}`))