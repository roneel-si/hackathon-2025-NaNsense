// One renderer per type. Keep texts short & factual.

export function renderCommentary(r: any) {
    const emb_text =
      `IPL ${r.season}, ${r.batting_team} vs ${r.bowling_team}, Innings ${r.innings}, ` +
      `Over ${r.over}.${r.ball}: ${r.bowler} to ${r.batter} — ` +
      `${r.runs_off_bat + (r.extras || 0)} run(s). ` +
      `Note: ${r.text}`;
    return withCommon(r, emb_text, {
      teams: [r.batting_team, r.bowling_team],
      players: [r.batter, r.bowler]
    });
  }
  
  export function renderMatchInfo(r: any) {
    const res = r.result ? `Result: ${r.result.winner} won by ${r.result.margin}.` : "";
    const emb_text = `${r.league} ${r.season}: ${r.teams?.join(" vs ")} at ${r.venue} on ${r.date}. ` +
                     `Toss: ${r.toss_winner} chose ${r.toss_decision}. ${res}`;
    return withCommon(r, emb_text, { teams: r.teams, players: [] });
  }
  
  export function renderPlayerBio(r: any) {
    const emb_text =
      `${r.player} (born ${r.dob}) is a ${r.role}. ` +
      `Batting: ${r.batting_style}. Bowling: ${r.bowling_style}. ` +
      `Teams: ${(r.teams || []).join(", ")}. ` +
      `Highlights: ${(r.highlights || []).join(" | ")}`;
    return withCommon(r, emb_text, { teams: r.teams, players: [r.player] });
  }
  
  export function renderPlayerStats(r: any) {
    const c = r.career || {};
    const season = r.by_season?.[0];
    const seasonLine = season
      ? `In ${season.season}: ${season.runs} runs (SR ${season.sr}), HS ${season.hs}.`
      : "";
    const emb_text =
      `${r.player} in ${r.league}: career ${c.runs} runs (SR ${c.strike_rate}), ` +
      `${c.matches} matches, avg ${c.avg}. ${seasonLine}`;
    return withCommon(r, emb_text, { teams: [], players: [r.player] });
  }
  
  export function renderTeamStats(r: any) {
    const s = r.summary || {};
    const emb_text =
      `${r.team} in ${r.league} ${r.season}: ${s.wins} wins, ${s.losses} losses, NRR ${s.nrr}. ` +
      `Highest total ${r.highest_total?.runs} vs ${r.highest_total?.opponent} on ${r.highest_total?.date}.`;
    return withCommon(r, emb_text, { teams: [r.team], players: [] });
  }

  export function renderTeamProfile(r: any) {
    const homeGround = r.home_ground ? `${r.home_ground.name} in ${r.home_ground.city}` : "Unknown venue";
    const titles = r.titles?.map((t: any) => `${t.name} (${t.count} time${t.count !== "1" ? "s" : ""}: ${t.years.join(", ")})`).join(", ") || "No titles";
    const emb_text = 
      `${r.team_name} (ID: ${r.team_id}) owned by ${r.owner}. ` +
      `Home ground: ${homeGround}. ` +
      `Titles: ${titles}. ` +
      `Background: ${r.bio?.substring(0, 200)}...`;
    return withCommon({ ...r, id: r.team_id }, emb_text, { 
      teams: [r.team_name], 
      players: [],
      type: "team_profile",
      team_id: r.team_id,
      league: "IPL"
    });
  }
  
  // Attach shared metadata + emb_text
  function withCommon(r: any, emb_text: string, extra: any = {}) {
    return {
      id: r.id || "unknown",
      type: r.type || "unknown",
      emb_text,
      sport: r.sport || extra.sport || "cricket",
      league: r.league || extra.league || "unknown",
      season: r.season || extra.season || "unknown",
      match_id: r.match_id || extra.match_id || null,
      teams: extra.teams || r.teams || [],
      players: extra.players || [],
      date: r.date || r.timestamp || r.as_of || extra.date || null,
      source_url: r.source_url || extra.source_url || null,
      raw: r // keep original for debugging
    };
  }
  