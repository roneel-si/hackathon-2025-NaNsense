export interface SearchResult {
  id: string;
  type: string;
  emb_text: string;
  sport: string;
  league: string;
  season: string;
  match_id: string;
  teams: string[];
  players: string[];
  date: string;
  source_url: string;
  raw: any;
}

export class ContextParser {
  
  static parseTeamProfile(result: SearchResult): string {
    const context: string[] = [];
    
    // Team basic info
    if (result.raw?.team_name) {
      context.push(`Team: ${result.raw.team_name}`);
    }
    
    if (result.raw?.owner) {
      context.push(`Owner: ${result.raw.owner}`);
    }
    
    // Home ground info
    if (result.raw?.home_ground) {
      const ground = result.raw.home_ground;
      if (ground.name && ground.location) {
        context.push(`Home Ground: ${ground.name}, ${ground.location}`);
      }
    }
    
    // Titles and achievements
    if (result.raw?.titles && Array.isArray(result.raw.titles)) {
      const titles = result.raw.titles.map((title: any) => {
        if (typeof title === 'object' && title.tournament && title.years) {
          return `${title.tournament} (${title.count} times: ${title.years.join(', ')})`;
        }
        return title;
      }).join(', ');
      context.push(`Titles: ${titles}`);
    }
    
    // Team bio/background
    if (result.raw?.bio) {
      context.push(`Background: ${result.raw.bio}`);
    }
    
    // League and sport
    if (result.league && result.league !== 'unknown') {
      context.push(`League: ${result.league}`);
    }
    if (result.sport) {
      context.push(`Sport: ${result.sport}`);
    }
    
    return context.join('\n');
  }
  
  static parseCommentary(result: SearchResult): string {
    const context: string[] = [];
    
    // Match context
    if (result.teams && result.teams.length > 0) {
      context.push(`Match: ${result.teams.join(' vs ')}`);
    }
    
    if (result.date) {
      context.push(`Date: ${result.date}`);
    }
    
    if (result.raw?.over || result.raw?.ball) {
      context.push(`Over/Ball: ${result.raw.over}.${result.raw.ball}`);
    }
    
    // Commentary text
    if (result.emb_text) {
      context.push(`Commentary: ${result.emb_text}`);
    }
    
    // Players involved
    if (result.players && result.players.length > 0) {
      context.push(`Players: ${result.players.join(', ')}`);
    }
    
    return context.join('\n');
  }
  
  static parseMatchInfo(result: SearchResult): string {
    const context: string[] = [];
    
    // Match details
    if (result.teams && result.teams.length > 0) {
      context.push(`Teams: ${result.teams.join(' vs ')}`);
    }
    
    if (result.date) {
      context.push(`Date: ${result.date}`);
    }
    
    if (result.raw?.venue) {
      context.push(`Venue: ${result.raw.venue}`);
    }
    
    if (result.raw?.result) {
      context.push(`Result: ${result.raw.result}`);
    }
    
    if (result.raw?.toss) {
      context.push(`Toss: ${result.raw.toss}`);
    }
    
    // Match summary
    if (result.emb_text) {
      context.push(`Match Info: ${result.emb_text}`);
    }
    
    return context.join('\n');
  }
  
  static parsePlayerBio(result: SearchResult): string {
    const context: string[] = [];
    
    // Player basic info
    if (result.raw?.player_name) {
      context.push(`Player: ${result.raw.player_name}`);
    }
    
    if (result.raw?.nationality) {
      context.push(`Nationality: ${result.raw.nationality}`);
    }
    
    if (result.raw?.role) {
      context.push(`Role: ${result.raw.role}`);
    }
    
    if (result.raw?.batting_style) {
      context.push(`Batting Style: ${result.raw.batting_style}`);
    }
    
    if (result.raw?.bowling_style) {
      context.push(`Bowling Style: ${result.raw.bowling_style}`);
    }
    
    // Teams
    if (result.teams && result.teams.length > 0) {
      context.push(`Teams: ${result.teams.join(', ')}`);
    }
    
    // Bio
    if (result.emb_text) {
      context.push(`Biography: ${result.emb_text}`);
    }
    
    return context.join('\n');
  }
  
  static parsePlayerStats(result: SearchResult): string {
    const context: string[] = [];
    
    // Player and match context
    if (result.raw?.player_name) {
      context.push(`Player: ${result.raw.player_name}`);
    }
    
    if (result.teams && result.teams.length > 0) {
      context.push(`Teams: ${result.teams.join(' vs ')}`);
    }
    
    if (result.season && result.season !== 'unknown') {
      context.push(`Season: ${result.season}`);
    }
    
    // Stats
    if (result.emb_text) {
      context.push(`Stats: ${result.emb_text}`);
    }
    
    return context.join('\n');
  }
  
  static parseTeamStats(result: SearchResult): string {
    const context: string[] = [];
    
    // Team and season context
    if (result.teams && result.teams.length > 0) {
      context.push(`Team: ${result.teams.join(', ')}`);
    }
    
    if (result.season && result.season !== 'unknown') {
      context.push(`Season: ${result.season}`);
    }
    
    if (result.league && result.league !== 'unknown') {
      context.push(`League: ${result.league}`);
    }
    
    // Stats
    if (result.emb_text) {
      context.push(`Team Stats: ${result.emb_text}`);
    }
    
    return context.join('\n');
  }
  
  static parseGeneric(result: SearchResult): string {
    // Fallback parser for unknown types
    const context: string[] = [];
    
    if (result.emb_text) {
      context.push(`Content: ${result.emb_text}`);
    }
    
    if (result.teams && result.teams.length > 0) {
      context.push(`Teams: ${result.teams.join(', ')}`);
    }
    
    if (result.players && result.players.length > 0) {
      context.push(`Players: ${result.players.join(', ')}`);
    }
    
    if (result.sport) {
      context.push(`Sport: ${result.sport}`);
    }
    
    return context.join('\n');
  }
  
  static parseSearchResult(result: SearchResult): string {
    switch (result.type) {
      case 'team_profile':
        return this.parseTeamProfile(result);
      case 'commentary':
        return this.parseCommentary(result);
      case 'match_info':
        return this.parseMatchInfo(result);
      case 'player_bio':
        return this.parsePlayerBio(result);
      case 'player_stats':
        return this.parsePlayerStats(result);
      case 'team_stats':
        return this.parseTeamStats(result);
      default:
        return this.parseGeneric(result);
    }
  }
  
  static createContext(searchResults: SearchResult[]): string {
    return searchResults
      .map(result => this.parseSearchResult(result))
      .join('\n\n---\n\n');
  }
}
