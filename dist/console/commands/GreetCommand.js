"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetCommand = void 0;
class GreetCommand {
    register(program) {
        program
            .command('greet')
            .description('Greet the user')
            .option('-n', 'Your name')
            .action((options) => {
            console.log(`Hello, ${options.name}!`);
        });
    }
}
exports.GreetCommand = GreetCommand;
