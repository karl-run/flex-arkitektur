'use client'
import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryState } from 'next-usequerystate'
import { Alert, Select, Switch, UNSAFE_Combobox } from '@navikt/ds-react'

import { NaisApp } from '@/types'
import { fetchJsonMedRequestId } from '@/utlis/fetch'
import { Graph } from '@/components/Graph'

export const Arkitektur = (): ReactElement => {
    const [env, setEnv] = useQueryState('env', parseAsString.withDefault('prod'))
    const [visKafka, setVisKafka] = useQueryState('kafka', parseAsBoolean.withDefault(true))

    const [namespaces, setNamespaces] = useQueryState('namespace', parseAsArrayOf(parseAsString).withDefault(['flex']))
    const { data, error, isFetching } = useQuery<NaisApp[], Error>({
        queryKey: [`nais-apper`, env],
        queryFn: async () => {
            const url = `/api/v1/naisapper?env=${env}`

            return await fetchJsonMedRequestId(url)
        },
    })
    if (!data || isFetching) {
        return <h2>Loading...</h2>
    }
    if (error) {
        return <Alert variant="error">Kunne ikke hente data fra api</Alert>
    }

    // unike namespaces fra data
    const alleNamespaces = Array.from(new Set(data.map((app) => app.namespace)))
    const onToggleSelected = (option: string, isSelected: boolean): void => {
        if (isSelected) {
            setNamespaces([...namespaces, option])
        } else {
            setNamespaces(namespaces.filter((o) => o !== option))
        }
    }
    return (
        <>
            <div className="h-32 p-10">
                <div className="flex gap-2">
                    <UNSAFE_Combobox
                        label="Namespace"
                        options={alleNamespaces}
                        isMultiSelect
                        selectedOptions={namespaces}
                        onToggleSelected={onToggleSelected}
                    />
                    <Select
                        label="Miljø"
                        value={env}
                        onChange={(e) => {
                            setEnv(e.target.value)
                        }}
                    >
                        <option value="prod">Produksjon</option>
                        <option value="dev">Utvikling</option>
                    </Select>
                    <div className="self-end">
                        <Switch checked={visKafka} onChange={() => setVisKafka(!visKafka)}>
                            Vis Kafka
                        </Switch>
                    </div>
                </div>
            </div>
            <Graph apper={data} namespaces={namespaces} visKafka={visKafka} />
        </>
    )
}