const { SlashCommandBuilder } = require('discord.js');

// Import commands
const balanceCommand = require('../commands/balance/balance');
const helpCommand = require('../commands/utility/help');
const networksCommand = require('../commands/utility/networks');
const statusCommand = require('../commands/utility/status');

describe('Discord Commands', () => {
  describe('Balance Command', () => {
    test('should have correct command structure', () => {
      expect(balanceCommand).toHaveProperty('data');
      expect(balanceCommand).toHaveProperty('execute');
      expect(balanceCommand.data).toBeInstanceOf(SlashCommandBuilder);
    });

    test('should have correct command name', () => {
      expect(balanceCommand.data.name).toBe('balance');
    });

    test('should have required address option', () => {
      const options = balanceCommand.data.options;
      const addressOption = options.find(opt => opt.name === 'address');
      
      expect(addressOption).toBeDefined();
      expect(addressOption.required).toBe(true);
    });

    test('should have optional network option', () => {
      const options = balanceCommand.data.options;
      const networkOption = options.find(opt => opt.name === 'network');
      
      expect(networkOption).toBeDefined();
      expect(networkOption.required).toBe(false);
    });

    test('should have correct network choices', () => {
      const options = balanceCommand.data.options;
      const networkOption = options.find(opt => opt.name === 'network');
      
      expect(networkOption.choices).toHaveLength(5);
      expect(networkOption.choices).toContainEqual(
        expect.objectContaining({ name: 'All Networks', value: 'all' })
      );
      expect(networkOption.choices).toContainEqual(
        expect.objectContaining({ name: 'Ethereum', value: 'ethereum' })
      );
    });
  });

  describe('Help Command', () => {
    test('should have correct command structure', () => {
      expect(helpCommand).toHaveProperty('data');
      expect(helpCommand).toHaveProperty('execute');
      expect(helpCommand.data).toBeInstanceOf(SlashCommandBuilder);
    });

    test('should have correct command name', () => {
      expect(helpCommand.data.name).toBe('help');
    });
  });

  describe('Networks Command', () => {
    test('should have correct command structure', () => {
      expect(networksCommand).toHaveProperty('data');
      expect(networksCommand).toHaveProperty('execute');
      expect(networksCommand.data).toBeInstanceOf(SlashCommandBuilder);
    });

    test('should have correct command name', () => {
      expect(networksCommand.data.name).toBe('networks');
    });
  });

  describe('Status Command', () => {
    test('should have correct command structure', () => {
      expect(statusCommand).toHaveProperty('data');
      expect(statusCommand).toHaveProperty('execute');
      expect(statusCommand.data).toBeInstanceOf(SlashCommandBuilder);
    });

    test('should have correct command name', () => {
      expect(statusCommand.data.name).toBe('status');
    });
  });

  describe('Command Execution', () => {
    test('all commands should have async execute function', () => {
      const commands = [balanceCommand, helpCommand, networksCommand, statusCommand];
      
      commands.forEach(command => {
        expect(typeof command.execute).toBe('function');
        expect(command.execute.constructor.name).toBe('AsyncFunction');
      });
    });
  });
}); 