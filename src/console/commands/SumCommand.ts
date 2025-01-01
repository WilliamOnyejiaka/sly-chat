import { Command } from 'commander';
import { CommandInterface } from './interface';

export class SumCommand implements CommandInterface {
    register(program: Command): void {
        program
            .command('sum <num1> <num2>')
            .description('Add two numbers')
            .action((num1, num2) => {
                const sum = parseInt(num1) + parseInt(num2);
                console.log(`The sum is: ${sum}`);
            });
    }
}
