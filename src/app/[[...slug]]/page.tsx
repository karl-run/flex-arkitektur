import { ReactElement } from 'react'

import { hentTrelloKort } from '@/trello/trelloClient'
import { TrelloKortRendring } from '@/components/trelloKortRendring'
import { GithubRepoReadme } from '@/components/githubRepoReadme'
import { OkrKortRendring } from '@/components/okrKortRendring'
import { RetroKortRendring } from '@/components/retroKortRendring'

export default async function Docs({ params }: { params: { slug?: string[] } }): Promise<ReactElement> {
    const slug = params.slug || []
    const urlFraSlug = '/' + slug.join('/')

    switch (slug[0]) {
        case 'apper':
            return <GithubRepoReadme repo={slug[1]} />

        case 'okr-board': {
            const okrkortene = await hentTrelloKort(process.env['TRELLO_OKR_BOARD'])
            const kortet = slug.length > 1 ? okrkortene.find((k) => k.url === slug[1]) : okrkortene[0]
            if (kortet) {
                return <OkrKortRendring list={kortet} />
            }
            break
        }

        case 'retro-board': {
            const retrokortene = await hentTrelloKort(process.env['TRELLO_RETRO_BOARD'])
            const kortet = slug.length > 1 ? retrokortene.find((k) => k.url === slug[1]) : retrokortene[0]
            console.log('kortet', kortet) // eslint-disable-line
            if (kortet) {
                return <RetroKortRendring list={kortet} />
            }
            break
        }

        default: {
            const list = await hentTrelloKort(process.env['TRELLO_BOARD'])
            const kortet = list.flatMap((l) => l.cards).find((c) => c.url === urlFraSlug)
            if (kortet) {
                return <TrelloKortRendring kortet={kortet} />
            }
        }
    }

    return (
        <main>
            <h1>404 rart sted</h1>
        </main>
    )
}
