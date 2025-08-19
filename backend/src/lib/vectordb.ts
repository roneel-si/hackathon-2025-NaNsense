import * as lancedb from "@lancedb/lancedb";
import "@lancedb/lancedb/embedding/openai";
import { Float32, Utf8 } from "apache-arrow";

const DB_PATH = "./vectordb";

// Access embedding functionality from lancedb.embedding
const { LanceSchema, getRegistry, EmbeddingFunction } = lancedb.embedding;

// Create OpenAI embedding function with fallback
function createEmbeddingFunction(): any {
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️  OPENAI_API_KEY not found, will use basic text storage");
    return null;
  }

  try {
    const func = getRegistry()
      .get("openai")
      ?.create({ 
        model: process.env.EMBEDDING_MODEL || "text-embedding-ada-002",
        apiKey: process.env.OPENAI_API_KEY
      });
    
    if (!func) {
      throw new Error("Failed to create OpenAI embedding function");
    }
    
    return func;
  } catch (error) {
    console.log("⚠️  Failed to create embedding function, falling back to basic storage");
    return null;
  }
}

export async function getTable() {
  const db = await lancedb.connect(DB_PATH);
  try {
    const tbl = await db.openTable("chunks");
    return tbl;
  } catch {
    // Will create later in ingest when we have data
    return null;
  }
}

export async function createTableWithRows(rows: any[]) {
  const db = await lancedb.connect(DB_PATH);
  
  const func = createEmbeddingFunction();
  
  if (func) {
    console.log("🤖 Using LanceDB automatic embeddings with OpenAI");
    
    const schema = LanceSchema({
      id: new Utf8(),
      type: new Utf8(),
      emb_text: func.sourceField(new Utf8()),
      vector: func.vectorField(),
      sport: new Utf8(),
      league: new Utf8(),
      season: new Utf8(),
      match_id: new Utf8(),
      teams: new Utf8(),
      players: new Utf8(),
      date: new Utf8(),
      source_url: new Utf8(),
      raw: new Utf8()
    });

    const processedRows = rows.map(row => ({
      id: String(row.id || "unknown"),
      type: String(row.type || "unknown"), 
      emb_text: String(row.emb_text || ""),
      sport: String(row.sport || "cricket"),
      league: String(row.league || "unknown"),
      season: String(row.season || "unknown"),
      match_id: String(row.match_id || ""),
      teams: JSON.stringify(row.teams || []),
      players: JSON.stringify(row.players || []),
      date: String(row.date || ""),
      source_url: String(row.source_url || ""),
      raw: JSON.stringify(row.raw || {})
    }));

    const tbl = await db.createEmptyTable("chunks", schema, {
      existOk: false // Overwrite existing table if it exists
    });
    
    await tbl.add(processedRows);
    return tbl;
  } else {
    console.log("📝 Using basic table storage without embeddings");
    
    const processedRows = rows.map(row => ({
      id: String(row.id || "unknown"),
      type: String(row.type || "unknown"), 
      emb_text: String(row.emb_text || ""),
      sport: String(row.sport || "cricket"),
      league: String(row.league || "unknown"),
      season: String(row.season || "unknown"),
      match_id: String(row.match_id || ""),
      teams: JSON.stringify(row.teams || []),
      players: JSON.stringify(row.players || []),
      date: String(row.date || ""),
      source_url: String(row.source_url || ""),
      raw: JSON.stringify(row.raw || {})
    }));

    const tbl = await db.createTable("chunks", processedRows, {
      existOk: false // Overwrite existing table if it exists
    });
    
    return tbl;
  }
}

export async function searchTable(query: string, limit: number = 10) {
  const tbl = await getTable();
  if (!tbl) {
    throw new Error("No table found. Please run ingestion first.");
  }
  
  const results = await tbl.search(query).limit(limit).toArray();
  
  return results.map(result => ({
    ...result,
    teams: JSON.parse(result.teams),
    players: JSON.parse(result.players),
    raw: JSON.parse(result.raw)
  }));
}

// Legacy function for manual embedding (can be removed if not needed elsewhere)
export async function embedText(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: process.env.EMBEDDING_MODEL || "text-embedding-ada-002"
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
