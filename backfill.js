/**
 * Backfill runner script
 * Transpiles and runs the TypeScript backfill script
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function run() {
  try {
    console.log('Running backfill script...\n')

    // Use tsx to run TypeScript directly
    const { stdout, stderr } = await execAsync('npx tsx src/scripts/backfill.ts', {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
    })

    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error) {
    console.error('Error running backfill:', error)
    process.exit(1)
  }
}

run()
