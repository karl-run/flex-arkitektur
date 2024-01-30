'use client'
import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, BodyLong, BodyShort, Heading } from '@navikt/ds-react'
import 'dayjs/locale/nb'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)
import { fetchJsonMedRequestId } from '@/utlis/fetch'
import { InntektsOpplysningerResponse } from '@/bigquery/inntektsopplysninger/IoType'

dayjs.locale('nb')
dayjs.extend(localizedFormat)

export const Inntektsopplysninger = (): ReactElement => {
    const { data, error, isFetching } = useQuery<InntektsOpplysningerResponse, Error>({
        queryKey: [`inntektsopplysninger`],
        queryFn: async () => {
            const url = `/api/v1/inntektsopplysninger`

            return await fetchJsonMedRequestId(url)
        },
    })
    if (error) return <Alert variant="error">Error: {error.message}</Alert>
    if (!data || isFetching) return <></>

    const tidligsteDato = data.data.sort((a, b) => a.sendt.value.localeCompare(b.sendt.value))[0]
    const senesteDato = data.data.sort((a, b) => b.sendt.value.localeCompare(a.sendt.value))[0]
    const sistOppdatert = dayjs(senesteDato.sendt.value).format('LLLL')
    const formattertTidligste = dayjs(tidligsteDato.sendt.value).format('LLLL')
    const totalt = data.data.length

    const driftOpphort = data.data.filter((d) => d.drift_virksomheten_nei === 'CHECKED')
    const driftIkkeOpphort = data.data.filter((d) => d.drift_virksomheten_nei === null)
    const nyArbeidslivet = driftIkkeOpphort.filter((d) => d.ny_i_arbeidslivet_ja === 'CHECKED')
    const ikkeNyArbeidslivet = driftIkkeOpphort.filter((d) => d.ny_i_arbeidslivet_nei === 'CHECKED')
    const varigEndring = driftIkkeOpphort.filter((d) => d.varig_endring === 'JA')
    const ikkeVarigEndring = driftIkkeOpphort.filter((d) => d.varig_endring === 'NEI')
    const varigEndring25prosent = varigEndring.filter((d) => d.varig_endring_25_prosent === 'JA')
    const varigEndringUnder25prosent = varigEndring.filter((d) => d.varig_endring_25_prosent === 'NEI')

    const sistOppdatertTekst = 'Disse dataene er sist oppdatert ' + sistOppdatert
    const totaltTekst = `Det er totalt ${totalt} innsendte førstegangssøknader med svar på inntektsopplysninger siden ${formattertTidligste}`
    const driftenTekst = `Driften er opphørt i ${driftOpphort.length} stk. Det er ${prosent(
        driftOpphort.length,
        totalt,
        1,
    )} av alle svarene`

    const nyIArbeidslivetTekst = `Det er ${
        nyArbeidslivet.length
    } stk som har svart at de er nye i arbeidslivet. Det er ${prosent(
        nyArbeidslivet.length,
        driftIkkeOpphort.length,
        1,
    )} av de som har svart at driften ikke er opphørt.`

    const varigEndringTekst = `Av disse er det ${
        varigEndring.length
    } stk som har svart at det er varig endring i driften. Det er ${prosent(
        varigEndring.length,
        ikkeNyArbeidslivet.length,
        1,
    )} av de som har svart at de ikke er ny i arbeidslivet.`
    const varigEndring25Tekst = `Av disse er det ${
        varigEndring25prosent.length
    } stk som har svart at det er varig endring i driften. Det er ${prosent(
        varigEndring25prosent.length,
        varigEndring.length,
        1,
    )} av de som har svart at de hadde varig endring.`

    const maaSendeAntall = nyArbeidslivet.length + varigEndring25prosent.length
    const maaSendeTekst = `De med 25 prosent endring eller som er ny i arbeidslivet er må sende inn dokumenter. De er ${maaSendeAntall} stk og er ${prosent(
        maaSendeAntall,
        totalt,
    )} av totalen  `

    const varig_endring_opprettelse_nedleggelse = varigEndring.filter(
        (d) => d.varig_endring_opprettelse_nedleggelse === 'CHECKED',
    ).length
    const varig_endring_endret_innsats = varigEndring.filter((d) => d.varig_endring_endret_innsats === 'CHECKED').length
    const varig_endring_omlegging_av_virksomhet = varigEndring.filter(
        (d) => d.varig_endring_omlegging_av_virksomhet === 'CHECKED',
    ).length
    const varig_endring_endret_markedssituasjon = varigEndring.filter(
        (d) => d.varig_endring_endret_markedssituasjon === 'CHECKED',
    ).length
    const varig_endring_annet = varigEndring.filter((d) => d.varig_endring_annet === 'CHECKED').length

    return (
        <div className="pb-10">
            <Heading spacing size="large">
                Inntektsopplysninger datafortelling
            </Heading>
            <BodyLong spacing>
                Denne datafortellingen beskriver hva selvstendig næringsdrivende, fiskere og jorbrukere har svart på
                dette spørsmålet i søknaden.
            </BodyLong>
            <BodyLong spacing>{sistOppdatertTekst}</BodyLong>
            <BodyLong spacing>{totaltTekst}</BodyLong>
            <BodyLong spacing>{driftenTekst}</BodyLong>
            <BodyLong spacing>{nyIArbeidslivetTekst}</BodyLong>
            <BodyLong spacing>{varigEndringTekst}</BodyLong>
            <BodyLong spacing>{varigEndring25Tekst}</BodyLong>
            <BodyLong className="font-bold" spacing>
                {maaSendeTekst}
            </BodyLong>
            <Heading size="medium" level="2">
                Fordeling av alle svar
            </Heading>
            <div className="h-96">
                <Doughnut
                    width="400px"
                    height="400px"
                    data={{
                        labels: [
                            'Ingen drift i virksomheten ' + prosent(driftOpphort.length, totalt, 1),
                            'Ny i arbeidslivet ' + prosent(nyArbeidslivet.length, totalt, 1),
                            'Ingen varig endring ' + prosent(ikkeVarigEndring.length, totalt, 1),
                            'Varig endring under 25 prosent ' + prosent(varigEndringUnder25prosent.length, totalt, 1),
                            'Varig endring over 25 prosent ' + prosent(varigEndring25prosent.length, totalt, 1),
                        ],
                        datasets: [
                            {
                                data: [
                                    driftOpphort.length,
                                    nyArbeidslivet.length,
                                    ikkeVarigEndring.length,
                                    varigEndringUnder25prosent.length,
                                    varigEndring25prosent.length,
                                ],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                ],

                                borderWidth: 1,
                            },
                        ],
                    }}
                />
            </div>

            <div className="h-96 my-4 pb-10">
                <Heading size="medium" level="2">
                    Fordeling av årsaker til varig endring
                </Heading>
                <BodyShort>Brukeren kan velge flere, derfor summer prosenten rart.</BodyShort>
                <Doughnut
                    width="400px"
                    height="400px"
                    data={{
                        labels: [
                            'Opprettelse / nedleggelse av næringsvirksomhet ' +
                                prosent(varig_endring_opprettelse_nedleggelse, varigEndring.length, 1),
                            'Økt eller redusert innsats ' +
                                prosent(varig_endring_endret_innsats, varigEndring.length, 1),
                            'Omlegging av virksomheten ' +
                                prosent(varig_endring_omlegging_av_virksomhet, varigEndring.length, 1),
                            'Endret markedssituasjon ' +
                                prosent(varig_endring_endret_markedssituasjon, varigEndring.length, 1),
                            'Annet ' + prosent(varig_endring_annet, varigEndring.length, 1),
                        ],
                        datasets: [
                            {
                                data: [
                                    varig_endring_opprettelse_nedleggelse,
                                    varig_endring_endret_innsats,
                                    varig_endring_omlegging_av_virksomhet,
                                    varig_endring_endret_markedssituasjon,
                                    varig_endring_annet,
                                ],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                ],

                                borderWidth: 1,
                            },
                        ],
                    }}
                />
            </div>
        </div>
    )
}

function prosent(over: number, under: number, desimaler = 0): string {
    return `${((over / under) * 100).toFixed(desimaler)} %`
}
