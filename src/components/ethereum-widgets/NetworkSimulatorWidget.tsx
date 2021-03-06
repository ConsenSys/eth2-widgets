import React, { useState, useEffect } from 'react'
import { Collapse, Icon, Button } from 'antd';
import { CartesianGrid, XAxis, YAxis, Label, AreaChart, Area, Legend, Tooltip } from 'recharts';

import { MINIMAL_ETH_STAKED, BIGGEST_PROBABILITY, NET_REWARDS_COLOUR, REWARDS_COLOUR, PENALTIES_COLOUR } from './constants'
import { EthStakedSlider, OnlineProbabilitySlider, HonestProbabilitySlider } from './Sliders'
import { ControlsContainer, ChartContainer } from './Containers';
import { data } from '../../data'

import "./styles.css"

const { Panel } = Collapse;

export const getDataItems = (totalEthStaked: number, onlineProbability: number, honestProbability: number) => { // honestProbability is ignored
    console.log("totalEthStaked", totalEthStaked)
    console.log("onlineProbability", onlineProbability)
    const items = data.filter((item) => {
        return item.initial_staked_balance === (totalEthStaked * 1000000) && item.probability_online === (onlineProbability / 100)
    })

    return items
}

export const NetworkSimulatorWidget: React.FC = () => {
    const [ethStaked, setEthStaked] = useState(MINIMAL_ETH_STAKED)
    const [onlineProbability, setOnlineProbability] = useState(BIGGEST_PROBABILITY)
    const [honestProbability, setHonestProbability] = useState(BIGGEST_PROBABILITY)
    const [networkSimulationData, setNetworkSimulationData] = useState([])
    const [showAdvanceOptions, setShowAdvanceOptions] = useState(false)
    const [netRewardsActive, setNetRewardsActive] = useState(true)
    const [rewardsActive, setRewardsActive] = useState(true)
    const [penaltiesActive, setPenaltiesActive] = useState(true)
    const [isRunning, setIsRunning] = useState(false)

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
        const result = getDataItems(ethStaked, onlineProbability, honestProbability);
        console.log("Result", result)
        setNetworkSimulationData(result)
        setIsRunning(false)
    }

    return (
        <div className="widget-container">
            <ControlsContainer title="Network Simulation">
                <EthStakedSlider
                    disabled={false}
                    onChange={(e) => {
                        console.log("New Eth Staked Value", e)
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
                            disabled={false}
                            initialValue={BIGGEST_PROBABILITY}
                            onChange={(e) => {
                                console.log("New online probability value", e)
                                setOnlineProbability(e)
                            }}
                        />
                        <HonestProbabilitySlider
                            disabled={true}
                            initialValue={BIGGEST_PROBABILITY}
                            onChange={(e) => {
                                console.log("New honest probability value", e)
                                setHonestProbability(e)
                            }}
                        />
                    </Panel>
                </Collapse>
                <Button onClick={runSimulation} type="primary" block={true} loading={isRunning}>{isRunning ? "" : "Run"}</Button>
            </ControlsContainer>

            <ChartContainer isLoading={isRunning}>
                <AreaChart width={800} height={400} data={networkSimulationData}>
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

                    <Area type="monotone" dataKey={rewardsActive ? "network_percentage_rewards" : ""} stroke={REWARDS_COLOUR} fillOpacity={1} fill="url(#colorPv)" name="Rewards" />
                    <Area type="monotone" dataKey={netRewardsActive ? "network_percentage_net_rewards" : ""} stroke={NET_REWARDS_COLOUR} fillOpacity={1} fill="url(#colorUv)" name="Net rewards" />
                    <Area type="monotone" dataKey={penaltiesActive ? "network_percentage_penalties" : ""} stroke={PENALTIES_COLOUR} fillOpacity={1} fill="url(#colorQv)" name="Penalties" />

                    <CartesianGrid stroke="#D5DCE4" strokeDasharray="5 5" />

                    <XAxis stroke="#97A4BA" dataKey="month_number">
                        <Label style={{ textAnchor: 'middle', fontSize: '80%' }} value="Months" offset={0} fill="#97A4BA" position="insideBottom" />
                    </XAxis>

                    <YAxis stroke="#97A4BA" datakey="network_percentage_net_rewards" unit="%" name="net_rewards" viewBox={200} type="number" domain={[0, 20]} />

                </AreaChart>
            </ChartContainer>
        </div>
    )
}