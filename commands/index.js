import React, { useEffect, useState, Fragment } from 'react';
import { Box, Text, useApp, Color } from 'ink';
import Spinner from 'ink-spinner';
import runAudit from '../src/lighthouse';

/// Run lighthouse
const Run = ({}) => {
	const [running, setRunning] = useState(true);
	const [error, setError] = useState();
	const [reports, setReports] = useState();

	useEffect(() => {
		runAudit()
			.then(setReports)
			.catch(setError)
			.finally(() => setRunning(false))
	}, []);

	return running ? (
		<Running />
	) : error ? (
		<ShowError error={error} />
	) : (
		<Report reports={reports} />
	);
};

export default Run;

const Running = () => (
	<Box>
		<Color green><Spinner type="dots"/></Color>{' Running'}
	</Box>
);

const Report = ({ reports }) => {
	const { exit } = useApp();
	const succeeded = reports.reduce((acc, { succeeded }) => acc && succeeded);

	useEffect(() => {
		exit(succeeded ? undefined : false);
	}, []);

	return (
		<>
			{reports.map(report => (
				<Box key={report.url} marginBottom={1} flexDirection="column">
					{report.succeeded ? (
						<Color greenBright><Text>✔️ Success for {report.url}!</Text></Color>
					) : (
						<Color redBright><Text>✖️ Failed for {report.url}!</Text></Color>
					)}

					<Box marginLeft={2} flexDirection="column">
						{report.audits.map(auditLine => <ReportLine key={auditLine.name} audit={auditLine} />)}
					</Box>
				</Box>
			))}
		</>
	)
};

const ReportLine = ({ audit }) => (
	<Box flexDirection="column">
		{audit.succeeded ? (
			<>
				<Box>
					<Color greenBright>✔️ {audit.title}</Color>
					<Color gray>{' '}({audit.name})</Color>
				</Box>
				<Box paddingLeft={2}>
					<Color gray>{audit.value} / {audit.goal}</Color>
				</Box>
			</>
		) : (
			<>
				<Box>
					<Color redBright>✖️ {audit.title}</Color>
					<Color gray>{' '}({audit.name})</Color>
				</Box>
				<Box paddingLeft={2}>
					<Color red dim>{audit.value}</Color> / <Color gray>{audit.goal}</Color>
				</Box>
			</>
		)}
	</Box>
);


const ShowError = ({ error }) => {
	const { exit } = useApp();

	useEffect(() => {
		exit(error);
	}, []);

	return (
		<>
			<Color redBright>
				<Text>✖️ Error!</Text>
			</Color>
			<Color gray>
				<Text>{error.message}</Text>
			</Color>
		</>
	);
};
