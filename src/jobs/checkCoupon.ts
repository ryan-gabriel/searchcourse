/**
 * Standalone Udemy coupon checker.
 *
 * Usage: npm run check-coupon <url>
 *
 * Loads the coupon URL in a real browser, classifies it, prints the verdict,
 * and does NOT touch the database. Uses the same verification core as the
 * automated cleanup path.
 */

import { pathToFileURL } from 'url';
import { openUdemyProbe } from './lib/udemyProbe';
import { verifyCoupon } from './lib/verifyCoupon';

async function main() {
    const url = process.argv[2];
    if (!url) {
        console.error('usage: npm run check-coupon <udemy-course-url>');
        process.exit(1);
    }

    const probe = await openUdemyProbe();
    try {
        const verdict = await verifyCoupon(url, { fetchState: probe.fetchState });

        console.log('\n===== Coupon verdict =====');
        console.log(`status:   ${verdict.status}`);
        console.log(`price:    ${verdict.price === null ? 'n/a' : verdict.price}`);
        if (verdict.evidence.length) {
            console.log('evidence:');
            for (const line of verdict.evidence) console.log(`  - ${line}`);
        }
        console.log('==========================');

        process.exit(verdict.status === 'INVALID' ? 2 : 0);
    } finally {
        await probe.close();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}