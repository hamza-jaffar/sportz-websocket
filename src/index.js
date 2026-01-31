import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('🚀 Senior Architect: Initializing Sports Data CRUD Lifecycle...');

    // 1. CREATE: Insert a new match
    console.log('--- Step 1: Creating a Match ---');
    const [match] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Red Devils',
        awayTeam: 'Blue Stars',
        status: 'live',
        startTime: new Date(),
        homeScore: 1,
        awayScore: 0,
      })
      .returning();

    console.log('✅ Match Created:', match);

    // 2. CREATE: Add commentary for the match
    console.log('\n--- Step 2: Adding Commentary ---');
    const [event] = await db
      .insert(commentary)
      .values({
        matchId: match.id,
        minute: 23,
        period: '1st Half',
        eventType: 'GOAL',
        actor: 'John Doe',
        team: 'Red Devils',
        message: 'A stunning strike from outside the box!',
        metadata: { xG: 0.05, distance: '30 yards' },
        tags: ['goal', 'highlight'],
      })
      .returning();

    console.log('✅ Commentary Added:', event);

    // 3. READ: Fetch match with its commentary
    console.log('\n--- Step 3: Fetching Match Data ---');
    const matchData = await db.select().from(matches).where(eq(matches.id, match.id));
    const comments = await db.select().from(commentary).where(eq(commentary.matchId, match.id));
    
    console.log('✅ Match Summary:', matchData[0]);
    console.log('✅ Total Commentary Events:', comments.length);

    // 4. UPDATE: Update the match score
    console.log('\n--- Step 4: Updating Score ---');
    const [updatedMatch] = await db
      .update(matches)
      .set({ awayScore: 1 })
      .where(eq(matches.id, match.id))
      .returning();
    
    console.log('✅ Score Updated:', updatedMatch.homeScore, '-', updatedMatch.awayScore);

    // 5. DELETE: Cleanup (Optional, but demonstrates full lifecycle)
    console.log('\n--- Step 5: Cleaning Up ---');
    await db.delete(commentary).where(eq(commentary.matchId, match.id));
    await db.delete(matches).where(eq(matches.id, match.id));
    console.log('✅ Test Data Deleted.');

    console.log('\n🎯 Full CRUD Lifecycle Completed Successfully.');
  } catch (error) {
    if (error.message.includes('relation "matches" does not exist')) {
      console.error('❌ Database tables not found. Did you run `npm run db:generate` and `npm run db:migrate`?');
    } else {
      console.error('❌ Critical Error during CRUD:', error);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔒 Database pool closed.');
    }
  }
}

main();