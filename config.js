const { abi, networks } = require('./build/contracts/TodoList.json')

const TODO_LIST_ABI = abi;

module.exports = {
    networks,
    TODO_LIST_ABI
};