import "dotenv/config";
import { VectorIngestionService } from "../services/VectorIngestionService.js";

async function main() {
  const ingestionService = new VectorIngestionService({
    verbose: true // Enable logging for the script
  });

  const result = await ingestionService.ingestData();

  if (result.success) {
    console.log(`✅ Successfully ingested ${result.totalProcessed} records!`);
    if (result.newRecords > 0) {
      console.log(`➕ Added ${result.newRecords} new records`);
    }
    if (result.existingRecords > 0) {
      console.log(`📊 Found ${result.existingRecords} existing records`);
    }
    console.log("🔍 Vector search is ready!");
  } else {
    console.error(`❌ ${result.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
