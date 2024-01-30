export interface InnteksOpplysningSoknad {
    sendt: {
        value: string
    }
    drift_virksomheten_ja: string | null
    drift_virksomheten_nei: string | null
    drift_virksomheten_opphort_dato: string | null
    ny_i_arbeidslivet_ja: string | null
    ny_i_arbeidslivet_dato: string | null
    ny_i_arbeidslivet_nei: string | null
    varig_endring: string | null
    varig_endring_opprettelse_nedleggelse: string | null
    varig_endring_endret_innsats: string | null
    varig_endring_omlegging_av_virksomhet: string | null
    varig_endring_endret_markedssituasjon: string | null
    varig_endring_annet: string | null
    varig_endring_25_prosent: string | null
}

export interface InntektsOpplysningerResponse {
    tidspunkt: number
    data: InnteksOpplysningSoknad[]
}
