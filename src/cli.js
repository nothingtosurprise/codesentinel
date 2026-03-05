#!/usr/bin/env node
import { program } from 'commander';
import { reviewCommand } from './commands/review.js';
import { scanCommand } from './commands/scan.js';
import { configCommand } from './commands/config.js';
import chalk from 'chalk';

console.log(chalk.greenBright(`
  ██████╗ ██████╗ ██████╗ ███████╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██║     ██║   ██║██║  ██║█████╗  
 ██║     ██║   ██║██║  ██║██╔══╝  
 ╚██████╗╚██████╔╝██████╔╝███████╗
  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
`) + chalk.bold.white(' SENTINEL') + chalk.gray(' — AI Code Review Agent v1.0.0\n'));

program
  .name('codesentinel')
  .description('AI-powered code review agent powered by Claude')
  .version('1.0.0');

// Review a single file
program
  .command('review <file>')
  .description('Review a single file for bugs, security issues, and quality')
  .option('-l, --lang <language>', 'Force a specific language (auto-detected by default)')
  .option('-f, --fix', 'Output a fixed version of the code')
  .option('-o, --output <file>', 'Save the report to a file (e.g. report.md)')
  .option('-s, --severity <level>', 'Min severity to show: critical | warning | suggestion', 'suggestion')
  .option('--json', 'Output raw JSON report')
  .action(reviewCommand);

// Scan an entire directory
program
  .command('scan <directory>')
  .description('Scan an entire directory/project for issues')
  .option('-e, --ext <extensions>', 'File extensions to scan (comma-separated)', 'js,ts,py,java,go')
  .option('--ignore <patterns>', 'Comma-separated patterns to ignore', 'node_modules,dist,.git')
  .option('-o, --output <file>', 'Save full report to file')
  .action(scanCommand);

// Config management
program
  .command('config')
  .description('Set your Anthropic API key and preferences')
  .option('--set-key <key>', 'Set your Anthropic API key')
  .option('--show', 'Show current config')
  .option('--reset', 'Reset all config')
  .action(configCommand);

program.parse();
