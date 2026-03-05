import chalk from 'chalk';
import Table from 'cli-table3';

export function renderReport(result, options = {}) {
  const { showFix = false, minSeverity = 'suggestion', jsonMode = false } = options;

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const sev = { critical: 0, warning: 1, suggestion: 2 };
  const minLevel = sev[minSeverity] ?? 2;

  // ── HEADER ──────────────────────────────────────────────────
  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(chalk.bold.white(' 📋 REVIEW COMPLETE'));
  console.log(chalk.gray('─'.repeat(60)));

  // ── SCORE ────────────────────────────────────────────────────
  const score = result.score || 0;
  const scoreColor = score >= 8 ? chalk.greenBright : score >= 5 ? chalk.yellow : chalk.redBright;
  const scoreBar = buildBar(score, 10);

  console.log(`\n ${chalk.bold('Language:')}  ${chalk.cyan(result.language || 'Unknown')}`);
  console.log(` ${chalk.bold('Score:    ')} ${scoreColor(`${score}/10`)}  ${scoreBar}  ${chalk.bold(result.scoreLabel || '')}`);

  // ── METRICS ──────────────────────────────────────────────────
  const m = result.metrics || {};
  console.log(`\n ${chalk.redBright('●')} Critical: ${chalk.bold(m.criticalCount || 0)}   ${chalk.yellow('●')} Warnings: ${chalk.bold(m.warningCount || 0)}   ${chalk.greenBright('●')} Suggestions: ${chalk.bold(m.suggestionCount || 0)}   ${chalk.blue('●')} Security: ${chalk.bold(m.securityIssues || 0)}`);
  console.log(` ${chalk.gray(`Lines reviewed: ${m.linesReviewed || '?'}`)}\n`);

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.bold(' 💬 SUMMARY'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(' ' + chalk.white(result.summary || '') + '\n');

  // ── HIGHLIGHTS ───────────────────────────────────────────────
  if (result.highlights?.length) {
    console.log(chalk.bold.greenBright(' ✅ What\'s Good:'));
    result.highlights.forEach(h => console.log(`  ${chalk.green('+')} ${h}`));
    console.log('');
  }

  // ── ISSUES ───────────────────────────────────────────────────
  const issues = (result.issues || []).filter(i => sev[i.severity] <= minLevel);

  if (issues.length === 0) {
    console.log(chalk.bold.greenBright(' 🎉 No issues found at this severity level!\n'));
  } else {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold(` 🔍 ISSUES (${issues.length})`));
    console.log(chalk.gray('─'.repeat(60)));

    issues.forEach((issue) => {
      const icon   = issue.severity === 'critical' ? chalk.redBright('🔴 CRITICAL')
                   : issue.severity === 'warning'  ? chalk.yellow('🟡 WARNING ')
                   :                                  chalk.greenBright('🟢 SUGGEST ');

      const cat = chalk.gray(`[${issue.category || ''}]`);
      const loc = chalk.blue(`  📍 ${issue.line || 'General'}`);

      console.log(`\n ${icon} ${cat} ${chalk.bold(issue.title)}`);
      console.log(`${loc}`);
      console.log(`  ${chalk.white(issue.description)}`);
      if (issue.fix) {
        console.log(`  ${chalk.cyan('→ Fix:')} ${issue.fix}`);
      }
    });
    console.log('');
  }

  // ── FIXED CODE ───────────────────────────────────────────────
  if (showFix && result.fixedCode) {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold.greenBright(' ✨ FIXED CODE'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.green(result.fixedCode));
    console.log('');
  }

  console.log(chalk.gray('─'.repeat(60) + '\n'));
}

export function renderScanSummary(results) {
  console.log('\n' + chalk.gray('═'.repeat(60)));
  console.log(chalk.bold.white('  📊 SCAN COMPLETE — PROJECT REPORT'));
  console.log(chalk.gray('═'.repeat(60)));

  let totalCritical = 0, totalWarnings = 0, totalSuggestions = 0;

  const table = new Table({
    head: [
      chalk.bold('File'),
      chalk.bold('Score'),
      chalk.redBright('Critical'),
      chalk.yellow('Warnings'),
      chalk.greenBright('Suggest'),
    ],
    colWidths: [30, 8, 10, 10, 10],
    style: { head: [], border: ['gray'] },
  });

  results.forEach(({ file, result, error }) => {
    if (error) {
      table.push([chalk.gray(file), chalk.red('ERR'), '-', '-', '-']);
      return;
    }
    const m = result.metrics || {};
    const score = result.score || 0;
    const scoreStr = (score >= 8 ? chalk.greenBright : score >= 5 ? chalk.yellow : chalk.redBright)(score + '/10');
    table.push([
      chalk.cyan(truncate(file, 28)),
      scoreStr,
      chalk.redBright(m.criticalCount || 0),
      chalk.yellow(m.warningCount || 0),
      chalk.greenBright(m.suggestionCount || 0),
    ]);
    totalCritical   += m.criticalCount   || 0;
    totalWarnings   += m.warningCount    || 0;
    totalSuggestions += m.suggestionCount || 0;
  });

  console.log(table.toString());

  const avgScore = results
    .filter(r => !r.error)
    .reduce((sum, r) => sum + (r.result?.score || 0), 0) / (results.filter(r => !r.error).length || 1);

  console.log(`\n ${chalk.bold('Files scanned:')}    ${results.length}`);
  console.log(` ${chalk.bold('Average score:')}    ${(avgScore >= 8 ? chalk.greenBright : avgScore >= 5 ? chalk.yellow : chalk.redBright)(avgScore.toFixed(1) + '/10')}`);
  console.log(` ${chalk.redBright('Total critical:')}   ${totalCritical}`);
  console.log(` ${chalk.yellow('Total warnings:')}   ${totalWarnings}`);
  console.log(` ${chalk.greenBright('Total suggestions:')} ${totalSuggestions}`);
  console.log('');
}

function buildBar(val, max) {
  const filled = Math.round((val / max) * 10);
  const color  = val >= 8 ? chalk.greenBright : val >= 5 ? chalk.yellow : chalk.redBright;
  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(10 - filled));
}

function truncate(str, len) {
  return str.length > len ? '...' + str.slice(-(len - 3)) : str;
}
