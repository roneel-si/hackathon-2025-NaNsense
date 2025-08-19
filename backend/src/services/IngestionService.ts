import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data", "chunks");
const API_DOMAIN = "https://stg-rr.sportz.io";
const MULTISPORT_CLIENT_ID = "2727d237c6";
const TEAMS_API = `${API_DOMAIN}/cricket/static/json/{{TEAM_ID}}_team.json`;

const TYPE_DIRS = {
	commentary: "commentary",
	match_info: "match_info",
	player_bio: "player_bios",
	player_stats: "player_stats",
	team_stats: "team_stats",
};

async function main(tournamentIds: number[]) {
	let teams: string[] = [];
	let matchIds: string[] = [];
	for (const tournamentId of tournamentIds) {
		const API = `${API_DOMAIN}/default.aspx?methodtype=3&client=${MULTISPORT_CLIENT_ID}&sport=1&league=0&timezone=0530&language=en&tournament=${tournamentId}`;
		try {
			const response = await fetch(API);

			const data = await response.json();
			data.matches.forEach((match: any) => {
				matchIds.push(match.game_id);
				match.participants.forEach((participant: any) => {
					if (!teams.includes(participant.id)) {
						teams.push(participant.id);
					}
				});
			});
		} catch (error) {
			console.error(
				`Error fetching data for tournament ${tournamentId}:`,
				error,
			);
		}
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
}

main([7126]).catch((err) => {
	console.error(err);
	process.exit(1);
});
