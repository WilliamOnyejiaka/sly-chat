"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
// program
//     .version('1.0.0')
//     .description('A simple CLI app using Commander.js and TypeScript');
//     .option('-n, --name <name>', 'Your name', 'Guest');
// program
//     .command('greet')
//     .description('Greet the user')
//     .action(() => {
//         console.log(`Hello, ${program.opts().name}!`);
//     });
// program
//     .command('greet')
//     .description('Greet the user')
//     .option('-n, --name <name>', 'Your name', 'Guest') // Default name is 'Guest'
//     .action(function (this: Command) {
//         const options = this.opts(); // Correctly access the options
//         console.log(`Hello, ${options.name}!`);
//     });
// program
//     .command('greet <name>') // Here, 'name' is an argument
//     .description('Greet the user')
//     .action((name) => {
//         console.log(`Hello, ${name}!`);
//     });
// program.parse(process.argv);
// import { CommandInterface } from './commands/interface';
// import { GreetCommand } from './commands/GreetCommand';
// import { SumCommand } from './commands/SumCommand';
// export class CLI {
//     private readonly program: Command = new Command();
//     private readonly commands: CommandInterface[] = [];
//     constructor() {
//         this.program.version('1.0.0').description('A modular CLI application using OOP');
//     }
//     private loadCommands(): void {
//         // * Load the commands
//         this.commands.forEach((command) => command.register(this.program));
//     }
//     public addCommand(command: CommandInterface){
//         // * Register commands here
//         this.commands.push(command);
//     }
//     public run(): void {
//         this.loadCommands();
//         this.program.parse(process.argv);
//     }
// }
// const cli: CLI = new CLI();
// cli.addCommand(new GreetCommand());
// cli.addCommand(new SumCommand());
// cli.run();
program
    .name('index')
    .description('CLI to some JavaScript string utilities')
    .version('0.8.0');
program.command('split')
    .description('Split a string into substrings and display as an array')
    // .argument('<string>', 'string to split')
    .usage('[options] <>')
    .option('--first', 'display just the first substring')
    // .option('-s, --separator <char>', 'separator character', ',')
    .action((options) => {
    // const limit = options.first ? 1 : undefined;
    // console.log(str.split(options.separator, limit));
    console.log();
});
program.parse();
