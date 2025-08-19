import fs from "fs";
import path from "path";
import { getTable, createTableWithRows } from "../lib/vectordb.js";
import {
  renderCommentary,
  renderMatchInfo,
  renderPlayerBio,
  renderPlayerStats,
  renderTeamStats,
  renderTeamProfile
} from "../lib/renderers.js";

export interface IngestionConfig {
  dataDir?: string;
  typeDirectories?: Record<string, string>;
  verbose?: boolean;
}

export interface IngestionResult {
  totalProcessed: number;
  newRecords: number;
  existingRecords: number;
  success: boolean;
  error?: string;
}

export class VectorIngestionService {
  private dataDir: string;
  private typeDirectories: Record<string, string>;
  private verbose: boolean;

  constructor(config: IngestionConfig = {}) {
    const root = process.cwd();
    this.dataDir = config.dataDir || path.join(root, "src/data", "chunks");
    this.typeDirectories = config.typeDirectories || {
      team_profile: "team_profile",
      commentary: "commentary",
      match_info: "match_info",
      player_bio: "player_bios",
      player_stats: "player_stats",
      team_stats: "team_stats"
    };
    this.verbose = config.verbose || false;
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }

  private readJSONFiles(dir: string): any[] {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const files = fs.readdirSync(dir)
      .filter((f: string) => f.endsWith(".json"));
    return files.map((f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  }

  private renderRecord(r: any): any {
    switch (r.type) {
      case "commentary": return renderCommentary(r);
      case "match_info": return renderMatchInfo(r);
      case "player_bio": return renderPlayerBio(r);
      case "player_stats": return renderPlayerStats(r);
      case "team_stats": return renderTeamStats(r);
      case "team_profile": return renderTeamProfile(r);
      default: return null;
    }
  }

  private async processRecords(): Promise<any[]> {
    const all = [];
    
    for (const [type, sub] of Object.entries(this.typeDirectories)) {
      const dir = path.join(this.dataDir, sub);
      const items = this.readJSONFiles(dir);
      
      for (const r of items) {
        const recordWithType = { ...r, type };
        const rendered = this.renderRecord(recordWithType);
        if (rendered && rendered.emb_text) {
          all.push(rendered);
        }
      }
    }

    return all;
  }

  async ingestData(): Promise<IngestionResult> {
    try {
      const allRecords = await this.processRecords();
      
      if (allRecords.length === 0) {
        return {
          totalProcessed: 0,
          newRecords: 0,
          existingRecords: 0,
          success: false,
          error: "No records found in data directories"
        };
      }

      let table = await getTable();
      let newRecordsCount = 0;
      let existingRecordsCount = 0;

      if (!table) {
        table = await createTableWithRows(allRecords);
        newRecordsCount = allRecords.length;
      } else {
        try {
          const existingRecords = await table.query().toArray();
          const existingIds = new Set(existingRecords.map((record: any) => record.id));
          const newRecords = allRecords.filter(record => !existingIds.has(record.id));
          
          existingRecordsCount = existingRecords.length;
          
          if (newRecords.length === 0) {
            return {
              totalProcessed: allRecords.length,
              newRecords: 0,
              existingRecords: existingRecordsCount,
              success: true
            };
          }
          
          await table.add(newRecords);
          newRecordsCount = newRecords.length;
          
        } catch (error) {
          table = await createTableWithRows(allRecords);
          newRecordsCount = allRecords.length;
        }
      }

      return {
        totalProcessed: allRecords.length,
        newRecords: newRecordsCount,
        existingRecords: existingRecordsCount,
        success: true
      };

    } catch (error: any) {
      const errorMessage = `Ingestion failed: ${error.message}`;
      this.log(errorMessage);
      return {
        totalProcessed: 0,
        newRecords: 0,
        existingRecords: 0,
        success: false,
        error: errorMessage
      };
    }
  }

  async getTableStats(): Promise<{ recordCount: number; recordsByType: Record<string, number> } | null> {
    try {
      const table = await getTable();
      if (!table) {
        return null;
      }

      const records = await table.query().toArray();
      const recordsByType = records.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        recordCount: records.length,
        recordsByType
      };
    } catch (error) {
      return null;
    }
  }
} 