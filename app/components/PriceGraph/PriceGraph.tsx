import { formatDistance, subDays, format, formatDate } from "date-fns";
import { useGetChartDataQuery } from "@/api/coinChart";
import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import "./module.PriceGraph.css";
import Loading from "../Loading/Loading";

// "Strictly" type or "Strongly" type your API data. That way you know what exactly you know what to expect from the data.
type PriceGraphProps = {
	coinId: string;
};

const PriceGraph = ({ coinId }: PriceGraphProps) => {
	// Auto-generated React hook from our API slice.
	const { data: graph, error, isLoading } = useGetChartDataQuery(coinId);
	const [dataPoints, setDataPoints] = useState();
	const [labels, setLabels] = useState();

	if (error) {
		console.error("There was an error displaying the graph");
	}

	useEffect(() => {
		if (!graph) return;

		// Fetch and process data
		const getDataPoints = () => {
			try {
				const result = graph.map((data: number[]) => data[1]);
				setDataPoints(result);
			} catch (error) {
				console.error("There was an error fetching chart data: ", error);
			}
		};

		getDataPoints();
	}, [graph]); // Run whenever graph changes

	useEffect(() => {
		if (!graph) return;

		const getLabels = () => {
			try {
				const result = graph.map(
					(label: number[]) => new Date(label[0] * 1000)
				);

				const formattedDate = result.map((date: number) =>
					format(date, "HH:mm")
				);

				setLabels(formattedDate);
			} catch (error) {
				console.error("There was an error fetching label data: ", error);
			}
		};

		getLabels();
	}, [graph]);

	useEffect(() => {
		// if (!dataPoints || !labels) return;

		const ctx = document.getElementById("coinChart") as HTMLCanvasElement;
		if (!ctx) return;
		let myChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: [
					{
						label: "Price 1w",
						data: dataPoints,
						borderWidth: 3,
						pointBorderWidth: 0,
						pointRadius: 2,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "red",
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: false,
					},
				},
			},
		});

		// Cleanup function to destroy Chart instance.
		return () => {
			if (myChart) {
				myChart.destroy();
			}
		};
	}, [dataPoints]);

	return (
		<>
			<div className="center-panel">
				{isLoading ? (
					<div className="flex justify-center items-center h-full">
						<Loading />
					</div>
				) : (
					<div className="line-graph">
						<canvas id="coinChart"></canvas>
					</div>
				)}
			</div>
		</>
	);
};

export default PriceGraph;
