import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data", "chunks");
const API_DOMAIN = "https://stg-rr.sportz.io";
const MULTISPORT_CLIENT_ID = "2727d237c6";
const TEAMS_API = `${API_DOMAIN}/cricket/static/json/{{TEAM_ID}}_team.json`;
const STATS_API = `${API_DOMAIN}/cricket/static/json/{{SERIESID}}_0_stats.json`;
const SERIES_TEAM_API = `${API_DOMAIN}/cricket/static/json/iplfeeds/{{TEAMID}}_all_players_{{SERIESID}}.json`;
const PLAYER_API = `${API_DOMAIN}/cricket/static/json/{{PLAYER_ID}}_json_profile.json`;

const TYPE_DIRS = {
	commentary: "commentary",
	match_info: "match_info",
	player_bio: "player_bios",
	player_stats: "player_stats",
	team_stats: "team_stats",
};

async function main(tournamentIds: number[]) {
	let teams: string[] = [];
	let matches: {
		game_id: string;
		league_code: string;
		participants: {
			id: string;
			name: string;
		}[];
		venue_name: string;
		highlight: string;
		start_date: string;
	}[] = [];
	let series: string[] = [];
	let seriesTeam: string[] = [];
	let playerList: string[] = [];
	for (const tournamentId of tournamentIds) {
		const API = `${API_DOMAIN}/default.aspx?methodtype=3&client=${MULTISPORT_CLIENT_ID}&sport=1&league=0&timezone=0530&language=en&tournament=${tournamentId}`;
		try {
			const response = await fetch(API);

			const data = await response.json();
			data.matches.forEach((match: any) => {
				matches.push(match);
				if (!series.includes(match.series_id)) {
					series.push(match.series_id);
				}
				match.participants.forEach((participant: any) => {
					if (!teams.includes(participant.id)) {
						teams.push(participant.id);
					}
				});

				let seriesTeamId1 =
					match.series_id + "_" + match.participants[0].id;
				let seriesTeamId2 =
					match.series_id + "_" + match.participants[1].id;
				if (!seriesTeam.includes(seriesTeamId1)) {
					seriesTeam.push(seriesTeamId1);
				}
				if (!seriesTeam.includes(seriesTeamId2)) {
					seriesTeam.push(seriesTeamId2);
				}
			});
		} catch (error) {
			console.error(
				`Error fetching data for tournament ${tournamentId}:`,
				error,
			);
		}
	}

	// for (const seriesId of series) {
	// 	const API = STATS_API.replace("{{SERIESID}}", seriesId);
	// 	const response = await fetch(API);
	// 	const data = await response.json();
	// 	let stats: any[] = [];
	// 	data.stats.forEach((stat: any) => {
	// 		stats.push(stat.stat_name);
	// 	});
	// 	console.log(stats.join(","));
	// fs.writeFileSync(
	// 	path.join(DATA_DIR, "series_stats", `${seriesId}.json`),
	// 	JSON.stringify(stats, null, 2),
	// );
	// }

	for (const seriesTeamId of seriesTeam) {
		const API = SERIES_TEAM_API.replace(
			"{{TEAMID}}",
			seriesTeamId.split("_")[1],
		).replace("{{SERIESID}}", seriesTeamId.split("_")[0]);
		const response = await fetch(API);
		const data = await response.json();
		data.players.forEach((player: any) => {
			if (!playerList.includes(player.player_details.id)) {
				playerList.push(player.player_details.id);
			}
		});
	}

	for (const playerId of playerList) {
		const API = PLAYER_API.replace("{{PLAYER_ID}}", playerId);
		const response = await fetch(API);
		const data = await response.json();

		const cleanBio = data.data[0].profile.Bio.Writeup.replace(
			/<[^>]*>/g,
			"",
		) // Remove HTML tags
			.replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
			.replace(/&amp;/g, "&") // Replace &amp; with &
			.replace(/&lt;/g, "<") // Replace &lt; with <
			.replace(/&gt;/g, ">") // Replace &gt; with >
			.replace(/&quot;/g, '"') // Replace &quot; with "
			.replace(/&#39;/g, "'") // Replace &#39; with '
			.replace(/\r\n/g, " ") // Replace \r\n with space
			.replace(/\r/g, " ") // Replace \r with space
			.replace(/\n/g, " ") // Replace \n with space
			.replace(/\s+/g, " ") // Replace multiple spaces with single space
			.trim(); // Remove leading/trailing whitespace

		let playerNode = {
			id: "pprofile_" + playerId,
			type: "player_bio",
			player: data.data[0].profile.Bio.Player_Name,
			full_name: data.data[0].profile.Bio.Player_Name_Full,
			dob: data.data[0].profile.Bio.Date_of_Birth,
			role: data.data[0].profile.Bio.Skill,
			batting_style: data.data[0].profile.Bio.Batting_Style,
			bowling_style: data.data[0].profile.Bio.Bowling_Style,
			teams: data.data[0].profile.Bio.Teams_Played.split(",").map(
				(team: string) => team.trim(),
			),
			bio: cleanBio,
			nationality: data.data[0].profile.Bio.Nationality,
			career_span: {
				Test: data.data[0].profile.Career_Span.Test,
				ODI: data.data[0].profile.Career_Span.ODI,
				IPL: data.data[0].profile.Career_Span.IPL,
			},
		};

		fs.writeFileSync(
			path.join(DATA_DIR, "player_profile", `pprofile_${playerId}.json`),
			JSON.stringify(playerNode, null, 2),
		);
	}

	for (const team of teams) {
		const API = TEAMS_API.replace("{{TEAM_ID}}", team);
		const response = await fetch(API);
		const data = await response.json();
		let titles: { name: string; count: number; years: string[] }[] = [];
		data.team_profile.trophy_cabinet.trophy_details.forEach(
			(trophy: any) => {
				if (trophy.parent_id != "-") {
					titles.push({
						name: trophy.parent_name,
						count: trophy.no_of_times_won,
						years: trophy.year.split(","),
					});
				}
			},
		);
		// Clean HTML and whitespace from bio
		const cleanBio = data.team_profile.writeup
			.replace(/<[^>]*>/g, "") // Remove HTML tags
			.replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
			.replace(/&amp;/g, "&") // Replace &amp; with &
			.replace(/&lt;/g, "<") // Replace &lt; with <
			.replace(/&gt;/g, ">") // Replace &gt; with >
			.replace(/&quot;/g, '"') // Replace &quot; with "
			.replace(/&#39;/g, "'") // Replace &#39; with '
			.replace(/\r\n/g, " ") // Replace \r\n with space
			.replace(/\r/g, " ") // Replace \r with space
			.replace(/\n/g, " ") // Replace \n with space
			.replace(/\s+/g, " ") // Replace multiple spaces with single space
			.trim(); // Remove leading/trailing whitespace

		let teamNode = {
			type: "team_profile",
			team_name: data.team_profile.team_display_name,
			team_id: data.team_profile.id,
			owner: data.team_profile.owner,
			home_ground: {
				name: data.team_profile.home_ground.split(",")[0],
				city: data.team_profile.home_ground.split(",")[1],
			},
			titles: titles,
			bio: cleanBio,
		};
		// Save team profile in the directory
		fs.writeFileSync(
			path.join(DATA_DIR, "team_profile", `tprofile_${team}.json`),
			JSON.stringify(teamNode, null, 2),
		);
	}

	for (const match of matches) {
		let year = match.start_date.split("-")[0];
		let matchNode = {
			id: match.game_id,
			type: "match_info",
			league: match.league_code,
			season: parseInt(year),
			match_id: match.game_id,
			date: match.start_date.split("T")[0],
			venue: match.venue_name.split(",")[0],
			teams: [match.participants[0].name, match.participants[1].name],
			result: {
				winner: match.participants.find(
					(participant: any) => participant.highlight === "true",
				)?.name,
			},
		};

		fs.writeFileSync(
			path.join(DATA_DIR, "match_info", `${match.game_id}.json`),
			JSON.stringify(matchNode, null, 2),
		);
	}
}

main([7126])
	.then((res) => {
		console.log("CHUNKS ADDED");
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
