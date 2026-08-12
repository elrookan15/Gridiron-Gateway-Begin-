// src/cfbdIngestionPipeline.ts
import axios from 'axios';

// Ensure you set CFBD_API_KEY in your environment variables
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';

export const syncCfbdTeams = async () => {
  try {
    console.log('📡 [CFBD Pipeline] Initiating NCAA Team Sync...');
    
    const apiKey = process.env.CFBD_API_KEY || 'MOCK_CFBD_KEY_FOR_LOCAL_DEV';

    // Fetch FBS teams
    const { data: fbsTeams } = await axios.get(`${CFBD_BASE_URL}/teams/fbs?year=2026`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    // In a production environment, you would use a PostgreSQL client (like 'pg' or Prisma)
    // to upsert these records into the `schools` table.
    
    const formattedTeams = (fbsTeams || []).map((team: any) => ({
      school_id: `fbs-${(team.school || 'university').toLowerCase().replace(/\s+/g, '-')}`,
      institution_name: team.school,
      mascot: team.mascot || '',
      abbreviation: team.abbreviation || '',
      tier: mapConferenceToTier(team.conference || ''),
      conference: team.conference || '',
      city: team.location?.city || '',
      state: team.location?.state || '',
      primary_color: team.color || '#000000',
      secondary_color: team.alt_color || '#ffffff',
      stadium_capacity: team.location?.capacity || 0
    }));

    console.log(`✅ [CFBD Pipeline] Successfully processed ${formattedTeams.length} FBS programs.`);
    return {
      status: 'success',
      count: formattedTeams.length,
      data: formattedTeams,
      programs: formattedTeams,
      syncedAt: new Date().toISOString(),
      artifactPath: 'data/ingestion/cfbd_teams.json',
      errors: [],
    };

  } catch (error: any) {
    console.error('❌ [CFBD Pipeline] Failed to sync team data:', error);
    // Graceful fallback during local development when API key is unauthenticated
    const fallbackData = [
      {
        school_id: 'fbs-texas',
        institution_name: 'University of Texas',
        mascot: 'Longhorns',
        abbreviation: 'TEX',
        tier: 'FBS_POWER_4',
        conference: 'SEC',
        city: 'Austin',
        state: 'TX',
        primary_color: '#BF5700',
        secondary_color: '#FFFFFF',
        stadium_capacity: 100119,
      },
      {
        school_id: 'fbs-ohio-state',
        institution_name: 'Ohio State University',
        mascot: 'Buckeyes',
        abbreviation: 'OSU',
        tier: 'FBS_POWER_4',
        conference: 'Big Ten',
        city: 'Columbus',
        state: 'OH',
        primary_color: '#BB0000',
        secondary_color: '#666666',
        stadium_capacity: 102780,
      },
    ];

    return {
      status: 'fallback',
      count: fallbackData.length,
      data: fallbackData,
      programs: fallbackData,
      syncedAt: new Date().toISOString(),
      artifactPath: 'data/ingestion/cfbd_teams.json',
      errors: [error.message || 'CFBD API unauthenticated'],
    };
  }
};

// Helper to determine Power 4 vs Group of 5
const mapConferenceToTier = (conference: string) => {
  const power4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
  return power4.includes(conference) ? 'FBS_POWER_4' : 'FBS_GROUP_OF_5';
};

export const runCfbdIngestionPipeline = syncCfbdTeams;
