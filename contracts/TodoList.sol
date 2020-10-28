// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    uint date;
    string content;
    string author;
    bool done;
  }

  mapping(uint => Task) public tasks;

  event TaskCreated(
    uint id,
    uint date,
    string content,
    string author,
    bool done
  );

  event TaskCompleted(
    uint id,
    bool done,
    uint date
  );

  constructor() public {
    createTask("First Task Created","ab");
    createTask("Second Task Created","cd");
  }
  function createTask(string memory _content,string memory _author) public {
    tasks[taskCount] = Task(taskCount,block.timestamp, _content,_author, false);
    emit TaskCreated(taskCount,block.timestamp, _content,_author, false);
    taskCount ++;
  }

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.done = !_task.done;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.done,block.timestamp);
  }

}
