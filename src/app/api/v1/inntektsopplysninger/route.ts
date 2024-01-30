import { logger } from '@navikt/next-logger'
import { NextResponse } from 'next/server'

import { verifyUserLoggedIn } from '@/auth/authentication'
import { hentInntektsopplysninger } from '@/bigquery/inntektsopplysninger/inntektsopplysninger'
import { InnteksOpplysningSoknad, InntektsOpplysningerResponse } from '@/bigquery/inntektsopplysninger/IoType'

let cachedData: InnteksOpplysningSoknad[] | undefined = undefined
let lastFetchTime = 0

export async function GET(): Promise<NextResponse<InntektsOpplysningerResponse>> {
    await verifyUserLoggedIn()
    const currentTime = Date.now()
    const cacheTimer = 6

    if (!cachedData || currentTime - lastFetchTime > 3600000 * cacheTimer) {
        cachedData = await hentInntektsopplysninger()
        lastFetchTime = currentTime
    } else {
        logger.info('Henter inntektsopplysninger fra cache')
    }
    const response: InntektsOpplysningerResponse = {
        tidspunkt: lastFetchTime,
        data: cachedData,
    }
    const nextResponse = NextResponse.json(response)
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300')

    return nextResponse
}
