import { Command } from 'commander';
import { CommandInterface } from './interface';

export class GreetCommand implements CommandInterface {
    register(program: Command): void {
        program
            .command('greet')
            .description('Greet the user')
            .option('-n', 'Your name')
            .action((options) => {
                console.log(`Hello, ${options.name}!`);
            });
    }
}
