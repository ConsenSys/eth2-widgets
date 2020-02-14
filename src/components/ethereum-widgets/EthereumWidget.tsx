import React, { useState, useEffect } from 'react'
import { Collapse, Icon, Spin } from 'antd';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label, AreaChart, Area, Legend, Tooltip } from 'recharts';

import { EthStakedSlider, OnlineProbabilitySlider, HonestProbabilitySlider } from './Sliders'

import { MINIMAL_ETH_STAKED, MINIMAL_AVERAGE_PERCENTAGE_VALIDATORS_ONLINE, BIGGEST_PROBABILITY } from './constants'

import "./styles.css"
import { Button } from 'antd'
import { buildFakeSimulationData } from './faker';

const { Panel } = Collapse;

export type WidgetType = 'network-simulation' | 'validator-simulation'

interface Props {
    title?: string
    type: WidgetType
}

const titlesPerWidget = {
    'network-simulation': "Network Simulation",
    'validator-simulation': "Validator Simulation"
}

const NET_REWARDS_COLOUR = "#3794FC"
const PENALTIES_COLOUR = "#FF0000"
const REWARDS_COLOUR = "#9D60FB"

const getTitle = (type: WidgetType, title?: string) => {
    return title ? title : titlesPerWidget[type]
}

export const EthereumWidget: React.FC<Props> = ({ title, type }: Props) => {
    const [isReady, setIsReady] = useState(false)
    const [wasmClient, setWasmClient] = useState(undefined)
    const [ethStaked, setEthStaked] = useState(MINIMAL_ETH_STAKED)
    const [onlineProbability, setOnlineProbability] = useState(BIGGEST_PROBABILITY)
    const [honestProbability, setHonestProbability] = useState(BIGGEST_PROBABILITY)
    const [averagePercentageOfValidatorOnline, setAveragePercentageOfValidatorOnline] = useState(MINIMAL_AVERAGE_PERCENTAGE_VALIDATORS_ONLINE)
    const [validatorAnnualInterest, setValidatorAnnualInterest] = useState(0)
    const [showAdvanceOptions, setShowAdvanceOptions] = useState(false)
    const [netRewardsActive, setNetRewardsActive] = useState(true)
    const [rewardsActive, setRewardsActive] = useState(true)
    const [penaltiesActive, setPenaltiesActive] = useState(true)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        const loadClient = async () => {
            import("eth2-simulator")
                .then(module => {
                    console.log("MODULE", module.get_validator_reward)
                    setWasmClient(module)
                    setIsReady(true)
                    console.log("WASM MODULE LOADED")
                }).catch((error) => {
                    console.log("Error loading the module")
                });
        }
        loadClient()
            .catch(e => {
                console.log("ERROR")
            })
    }, [])

    useEffect(() => {
        if (isReady) {
            console.log("WASM CLIENT", wasmClient)
            console.log("USE EFFECT RUNNING", ethStaked, averagePercentageOfValidatorOnline)
            const result = wasmClient.get_validator_reward(ethStaked, averagePercentageOfValidatorOnline);
            setValidatorAnnualInterest(result)
        }
    });

    const handleLegendClick = ({ value }) => {
        if (value === "Rewards") {
            setRewardsActive(!rewardsActive)
        }
        else if (value === "Net rewards") {
            setNetRewardsActive(!netRewardsActive)
        }
        else if (value === "Penalties") {
            setPenaltiesActive(!penaltiesActive)
        }
    }

    const runSimulation = () => {
        setIsRunning(true)
    }

    return (
        <div className="widget-container">
            <div className="controls-container">
                <h3 data-testid="widget-title">{getTitle(type, title)}</h3>
                <EthStakedSlider
                    onChange={(e) => {
                        console.log("New Eth Staked Value", e)
                        // call rust module
                        setEthStaked(e)
                    }}
                    initialValue={MINIMAL_ETH_STAKED}
                />
                <Collapse
                    accordion={true}
                    expandIcon={() => <Icon type="setting" />}
                    onChange={() => setShowAdvanceOptions(!showAdvanceOptions)}>
                    <Panel header="Advance options" key="advanced">
                        <OnlineProbabilitySlider
                            initialValue={BIGGEST_PROBABILITY}
                            onChange={(e) => {
                                console.log("New online probability value", e)
                                // call rust module
                                setOnlineProbability(e)
                            }}
                        />
                        <HonestProbabilitySlider
                            initialValue={BIGGEST_PROBABILITY}
                            onChange={(e) => {
                                console.log("New honest probability value", e)
                                // call rust module
                                setHonestProbability(e)
                            }}
                        />
                    </Panel>
                </Collapse>
                <Button onClick={runSimulation} type="primary" block={true} loading={isRunning}>{isRunning ? "" : "Run"}</Button>
            </div>
            <div className="chart-container">
                {isRunning ? <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #FAFAFC" }}><Spin tip="Running simulation..." /></div>
                    :
                    <AreaChart width={800} height={400} data={buildFakeSimulationData()}>
                        <Legend onClick={handleLegendClick} verticalAlign="top" align="right" height={36} />
                        <Tooltip formatter={(value, name, props) => (`${value}%`)} />
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={NET_REWARDS_COLOUR} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={NET_REWARDS_COLOUR} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={REWARDS_COLOUR} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={REWARDS_COLOUR} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorQv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={PENALTIES_COLOUR} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={PENALTIES_COLOUR} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <Area type="monotone" dataKey={rewardsActive ? "rewards" : ""} stroke={REWARDS_COLOUR} fillOpacity={1} fill="url(#colorPv)" name="Rewards" />
                        <Area type="monotone" dataKey={netRewardsActive ? "net_rewards" : ""} stroke={NET_REWARDS_COLOUR} fillOpacity={1} fill="url(#colorUv)" name="Net rewards" />
                        <Area type="monotone" dataKey={penaltiesActive ? "penalties" : ""} stroke={PENALTIES_COLOUR} fillOpacity={1} fill="url(#colorQv)" name="Penalties" />

                        <CartesianGrid stroke="#D5DCE4" strokeDasharray="5 5" />

                        <XAxis stroke="#97A4BA" dataKey="time">
                            <Label style={{ textAnchor: 'middle', fontSize: '80%' }} value="Months" offset={0} fill="#97A4BA" position="insideBottom" />
                        </XAxis>

                        <YAxis stroke="#97A4BA" datakey="net_rewards" unit="%" name="net_rewards" viewBox={200} />

                    </AreaChart>}
            </div>
            {/* <div className="chart-container">
                {isRunning ? <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #FAFAFC" }}><Spin tip="Running simulation..." /></div>
                    :
                    <LineChart width={800} height={400} data={buildFakeSimulationData()}>
                        <Legend onClick={handleLegendClick} verticalAlign="top" align="right" height={36} />
                        <Line type="monotone" strokeWidth={rewardsActive ? 1 : 0} dataKey="rewards" stroke={REWARDS_COLOUR} name="Rewards" />

                        <Line type="monotone" strokeWidth={netRewardsActive ? 1 : 0} dataKey="net_rewards" stroke={NET_REWARDS_COLOUR} name="Net rewards" />

                        <Line type="monotone" strokeWidth={penaltiesActive ? 1 : 0} dataKey="penalties" stroke={PENALTIES_COLOUR} name="Penalties" />
                        <CartesianGrid stroke="#D5DCE4" strokeDasharray="5 5" />
                        <XAxis stroke="#97A4BA" dataKey="time">
                            <Label style={{ textAnchor: 'middle', fontSize: '80%' }} value="Months" offset={0} fill="#97A4BA" position="insideBottom" />
                        </XAxis>
                        <YAxis stroke="#97A4BA" datakey="net_rewards" unit="%" name="net_rewards" viewBox={200} />
                    </LineChart>}
            </div> */}
        </div>
    )
}
// <AverageValidatorsOnline
//     onChange={(e) => {
//         console.log("New Eth Staked Value", e)
//         // call rust module
//         setAveragePercentageOfValidatorOnline(e)
//     }}
//     initialValue={MINIMAL_AVERAGE_PERCENTAGE_VALIDATORS_ONLINE}
// />