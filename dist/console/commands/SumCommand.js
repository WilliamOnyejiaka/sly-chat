"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SumCommand = void 0;
class SumCommand {
    register(program) {
        program
            .command('sum <num1> <num2>')
            .description('Add two numbers')
            .action((num1, num2) => {
            const sum = parseInt(num1) + parseInt(num2);
            console.log(`The sum is: ${sum}`);
        });
    }
}
exports.SumCommand = SumCommand;
