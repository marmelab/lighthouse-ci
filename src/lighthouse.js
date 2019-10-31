import cosmiconfig from 'cosmiconfig';
import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';
import autoParse from 'auto-parse';
import flatMap from "lodash/flatMap";

import path from 'path';
import { writeFileSync } from 'fs';

const configExplorer = cosmiconfig('lighthouseci');

const start = async () => {
    const { config: { urls, ...config } } = await configExplorer.search();

    if (Array.isArray(urls)) {
        return Promise.all(urls.map(
            urlConfig => startOnUrl({
                ...config, // Default config for all url
                ...urlConfig, // Config for this url
            })
        ));
    }

    const results = await startOnUrl(config);
    return [results];
};

export default start;

const startOnUrl = async ({ url, budgets, ...config }) => {
    const chrome = await launchChrome(defaultChromeConfig);

    const results = await lighthouse(
        url,
        { port: chrome.port, budgets },
        {
            ...defaultLighthouseConfig,
            audits: Object.keys(config)
        }
    );

    writeFileSync(path.resolve(__dirname, '../../results.json'), JSON.stringify(results, null, 4));

    await chrome.kill();
    
    const audits = Object.keys(config).map(auditName =>
        buildReport(
            results.lhr.audits[sanitizeAuditName(auditName)],
            autoParse(config[auditName])
        )
    );


    const allAudits = budgets
        ? audits.concat(buildPerformanceBudgetReport(results.lhr.audits['performance-budget'], budgets))
        : audits;
    
    return {
        url,
        audits: allAudits,
	    succeeded: allAudits.reduce((acc, { succeeded }) => acc && succeeded, true),
    };
};

const buildReport = (audit, goal) => {
    if (audit.scoreDisplayMode === 'binary') {
        return buildBinaryReport(audit, goal);
    }

    if (audit.scoreDisplayMode === 'numeric') {
        return buildNumericReport(audit, goal);
    }

    // Unsupported audit
    return undefined;
};

const buildBinaryReport = (audit, goal) => ({
    name: audit.id,
    title: audit.title,
    succeeded: new Boolean(audit.score) === new Boolean(goal),
    value: new Boolean(audit.score),
    goal: new Boolean(goal),
});

const buildNumericReport = (audit, goal) => ({
    name: audit.id,
    title: audit.title,
    succeeded: audit.numericValue <= goal,
    value: audit.numericValue,
    goal,
});

const buildPerformanceBudgetReport = (audit, budgets) => {
    return audit.details.items
        .map(item => {
            const sizeBudget = budgets[0].resourceSizes.find(budget => budget.resourceType === item.resourceType)
            const countBudget = budgets[0].resourceCounts.find(budget => budget.resourceType === item.resourceType)
            
            return {
                name: `${audit.id}-${item.resourceType}`,
                title: `${audit.title} - ${item.label}`,
                succeeded: sizeBudget && item.sizeOverBudget === 0
                    ? item.sizeOverBudget === 0
                    : countBudget
                    ? countBudget.budget > item.requestCount
                    : true,
                value: sizeBudget ? item.size : item.requestCount,
                goal: sizeBudget
                    ? sizeBudget.budget
                    : countBudget
                    ? countBudget.budget
                    : 0,
            };
        });
};

const defaultChromeConfig = {
    chromeFlags: ['--headless'],
};

const defaultLighthouseConfig = {
    extends: "lighthouse:default",
};

// Audits name in the config might have a prefix (such as metrics/first-contentful-paint)
// but they have the name without the prefix in the report
const sanitizeAuditName = name => name.substr(name.indexOf('/') + 1)

const getAuditSuccess = (audit, goal) => {
    switch (audit.scoreDisplayMode) {
        case 'binary':
            return (audit.score === 1) === new Boolean(goal);
        case 'numeric':
            return audit.score <= goal;
        default:
            switch(audit.id) {
                case 'performance-budget':
                    return audit.details.items.reduce((acc, item) => acc && item);
                default:
                    return undefined;
            }
    }
}

const getAuditValue = (audit, goal) => {
    switch (audit.scoreDisplayMode) {
        case 'binary':
            return audit.score === 1;
        case 'numeric':
            return audit.numericValue;
    }
}

