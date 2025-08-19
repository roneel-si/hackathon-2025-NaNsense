import { getTable } from "./src/lib/vectordb.js";

async function testBasicFunctionality() {
  try {
    console.log("🔍 Testing basic LanceDB functionality...\n");
    
    const table = await getTable();
    if (!table) {
      console.log("❌ No table found. Run `npm run ingest` first.");
      return;
    }
    
    const count = await table.countRows();
    console.log(`📊 Table has ${count} records\n`);
    
    // Get first few records to show what's available
    console.log("📋 Sample records:");
    const records = await table.query().limit(3).toArray();
    
    records.forEach((record, index) => {
      console.log(`\n${index + 1}. Team: ${JSON.parse(record.teams)[0] || 'Unknown'}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Type: ${record.type}`);
      console.log(`   Text: ${record.emb_text.substring(0, 100)}...`);
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Basic functionality is working!");
    console.log("💡 Add OPENAI_API_KEY to .env file for vector search capabilities.");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  }
}

testBasicFunctionality(); 