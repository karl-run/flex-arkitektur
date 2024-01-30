import { ReactElement } from 'react'

import { QueryClientWrap } from '@/components/QueryClientWrap'
import { Inntektsopplysninger } from '@/components/InntektsopplysningStats'

export default async function Docs({}: { params: { slug?: string[] } }): Promise<ReactElement> {
    return (
        <QueryClientWrap>
            <Inntektsopplysninger />
        </QueryClientWrap>
    )
}
