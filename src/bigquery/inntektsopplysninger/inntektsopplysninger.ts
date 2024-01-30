import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery'
import { logger } from '@navikt/next-logger'

import { isLocalOrDemo } from '@/utlis/env'
import { ioTestdata } from '@/bigquery/inntektsopplysninger/testdata'
import { InnteksOpplysningSoknad } from '@/bigquery/inntektsopplysninger/IoType'

export async function hentInntektsopplysninger(): Promise<InnteksOpplysningSoknad[]> {
    if (isLocalOrDemo) {
        logger.info('Henter inntektsopplysninger fra lokal testdata')

        return ioTestdata
    }

    logger.info('Henter inntektsopplysningsvar fra bigquery')

    const options: BigQueryOptions = {}
    if (process.env.GOOGLE_CLOUD_PROJECT) {
        options.projectId = process.env.GOOGLE_CLOUD_PROJECT
    }
    const bqTabell = '`flex-prod-af40.flex_dataset.sykepengesoknad_sporsmal_svar_view`'

    const bigquery = new BigQuery(options)
    const query = `
        WITH filtered_data AS (SELECT sykepengesoknad_uuid,
                                      sporsmal_tag,
                                      verdi,
                                      sendt
                               FROM ${bqTabell}
                               WHERE
                                   sporsmal_tag IN (
                                   'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_JA'
                                   , 'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_NEI'
                                   , 'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_OPPHORT'
                                   , 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_JA'
                                   , 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_DATO'
                                   , 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_NEI'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_OPPRETTELSE_NEDLEGGELSE'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ENDRET_INNSATS'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_OMLEGGING_AV_VIRKSOMHETEN'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ENDRET_MARKEDSSITUASJON'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ANNET'
                                   , 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_25_PROSENT'
                                   ))

        SELECT COALESCE(a.sendt, b.sendt, c.sendt, d.sendt, e.sendt, f.sendt, g.sendt, h.sendt, i.sendt, j.sendt,
                        k.sendt) as sendt,
               a.verdi           AS drift_virksomheten_ja,
               b.verdi           AS drift_virksomheten_nei,
               c.verdi           AS drift_virksomheten_opphort_dato,
               d.verdi           AS ny_i_arbeidslivet_ja,
               e.verdi           AS ny_i_arbeidslivet_dato,
               f.verdi           AS ny_i_arbeidslivet_nei,
               g.verdi           AS varig_endring,
               h.verdi           AS varig_endring_opprettelse_nedleggelse,
               i.verdi           AS varig_endring_endret_innsats,
               j.verdi           AS varig_endring_omlegging_av_virksomhet,
               k.verdi           AS varig_endring_endret_markedssituasjon,
               l.verdi           AS varig_endring_annet,
               m.verdi           AS varig_endring_25_prosent
        FROM (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_JA') a
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_NEI') b
             ON
                 a.sykepengesoknad_uuid = b.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_DRIFT_VIRKSOMHETEN_OPPHORT') c
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid) = c.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_JA') d
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid) =
                 d.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_DATO') e
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid) = e.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_NY_I_ARBEIDSLIVET_NEI') f
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid) = f.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT * FROM filtered_data WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING') g
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid) =
                 g.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_OPPRETTELSE_NEDLEGGELSE') h
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid) = h.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ENDRET_INNSATS') i
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid, h.sykepengesoknad_uuid) = i.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_OMLEGGING_AV_VIRKSOMHETEN') j
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid, h.sykepengesoknad_uuid, i.sykepengesoknad_uuid) =
                 j.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ENDRET_MARKEDSSITUASJON') k
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid, h.sykepengesoknad_uuid, i.sykepengesoknad_uuid,
                          j.sykepengesoknad_uuid) = k.sykepengesoknad_uuid
        FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_BEGRUNNELSE_ANNET') l
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid, h.sykepengesoknad_uuid, i.sykepengesoknad_uuid,
                          j.sykepengesoknad_uuid, k.sykepengesoknad_uuid) = l.sykepengesoknad_uuid
                 FULL OUTER JOIN
             (SELECT *
              FROM filtered_data
              WHERE sporsmal_tag = 'INNTEKTSOPPLYSNINGER_VARIG_ENDRING_25_PROSENT') m
             ON
                 COALESCE(a.sykepengesoknad_uuid, b.sykepengesoknad_uuid, c.sykepengesoknad_uuid,
                          d.sykepengesoknad_uuid, e.sykepengesoknad_uuid, f.sykepengesoknad_uuid,
                          g.sykepengesoknad_uuid, h.sykepengesoknad_uuid, i.sykepengesoknad_uuid,
                          j.sykepengesoknad_uuid, k.sykepengesoknad_uuid, l.sykepengesoknad_uuid) = m.sykepengesoknad_uuid;
    `

    const [job] = await bigquery.createQueryJob({
        query: query,
        location: 'europe-north1',
    })

    const [rows] = await job.getQueryResults()
    return rows
}
