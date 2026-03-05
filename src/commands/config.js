import chalk from 'chalk';
import { loadConfig, saveConfig, resetConfig, getConfigPath } from '../lib/config.js';

export function configCommand(options) {
  if (options.setKey) {
    const key = options.setKey.trim();
    if (!key.startsWith('sk-ant-')) {
      console.warn(chalk.yellow('\n  ⚠  Warning: Key does not look like a valid Anthropic API key (should start with sk-ant-)\n'));
    }
    saveConfig({ apiKey: key });
    console.log(chalk.greenBright(`\n  ✓ API key saved to ${getConfigPath()}\n`));
    console.log(chalk.gray('  You can now run: codesentinel review <file>\n'));
    return;
  }

  if (options.reset) {
    resetConfig();
    console.log(chalk.yellow('\n  ✓ Config reset.\n'));
    return;
  }

  if (options.show) {
    const config = loadConfig();
    console.log(chalk.bold('\n  Current Config:'));
    console.log(chalk.gray(`  Path: ${getConfigPath()}`));
    if (config.apiKey) {
      const masked = config.apiKey.slice(0, 12) + '...' + config.apiKey.slice(-4);
      console.log(`  API Key: ${chalk.cyan(masked)}`);
    } else {
      console.log(`  API Key: ${chalk.red('Not set')}`);
    }
    console.log('');
    return;
  }

  // Default: show help
  console.log(chalk.bold('\n  Config Commands:'));
  console.log(`  ${chalk.cyan('codesentinel config --set-key <key>')}   Save your Anthropic API key`);
  console.log(`  ${chalk.cyan('codesentinel config --show')}            Show current config`);
  console.log(`  ${chalk.cyan('codesentinel config --reset')}           Reset all settings`);
  console.log('');
}
