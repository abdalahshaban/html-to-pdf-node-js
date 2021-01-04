const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf');
const Web3 = require('web3');

const { TODO_LIST_ABI, networks } = require('./config')

const app = express();
let web3;
let todoListApi;
let account;
let taskCount;
let tasks = [];
let contentNum = 0;
let authorNum = 0;

app.set('view engine', 'ejs');
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build/contracts'));

const port = process.env.PORT || 3000;



app.get('/', async (req, res) => {
  await loadBlockChainData();
  await listOfTasks();
  let data = await createTask();
  // console.log(data, 'data');

  var content = fs.readFileSync('./views/index.ejs', 'utf8');
  content = content.replace('{{from}}', data.from)
  content = content.replace('{{to}}', data.to)
  content = content.replace('{{transactionHash}}', data.transactionHash)
  content = content.replace('{{content}}', data.content)
  content = content.replace('{{author}}', data.author)
  content = content.replace('{{isDone}}', data.isDone)

  res.render(`index`);

  let htmlToPdfOptions = {
    type: 'pdf',
    height: '650px',
    width: '750px',
    renderDelay: 1000,
    "base": `${req.protocol}://${req.get('host')}`,
    "orientation": "portrait",
    // "dpi": 200,
    "quality": 100,
    "border": {
      "left": "1cm",
      "right": "1cm",
      "top": "1cm",
      "bottom": "1cm"
    },
    "header": {
      "height": "10mm"
    },
    "footer": {
      "height": "10mm"
    }
  }


  fs.rmdirSync('pdf', { recursive: true })

  htmlPdf.create(content, htmlToPdfOptions).toFile(`pdf/contract${data.from}.pdf`, (err, result) => {
    if (err) return console.log(err, 'err');
    console.log(result, 'result');
    // res.render(`index`);
    // downloadFile(res);

  });

});


const loadBlockChainData = async () => {
  web3 = new Web3(new Web3.providers.WebsocketProvider("HTTP://127.0.0.1:8545"));
  const id = await web3.eth.net.getId();
  let TODO_LIST_ADDRESS = networks[id].address;

  const accounts = await web3.eth.getAccounts();
  account = accounts[1];
  todoListApi = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);

}

const listOfTasks = async () => {
  taskCount = await todoListApi.methods.taskCount().call();
  for (let i = 0; i < taskCount; i++) {
    const task = await todoListApi.methods.tasks(i).call();
    tasks.push(task);
  }
}

// app.get("/create", (req, res) => {
//   res.render(`index`)
//   console.log(todoListApi, 'todoListApi');
//   createTask();

// });

const createTask = async () => {
  contentNum++;
  authorNum++;
  // console.log(todoListApi.methods, 'todoListApi.methods');
  // console.log(account, 'account');
  // todoListApi.methods.createTask(`content${contentNum}`, `author${authorNum}`).send({ from: account, gas: 6721975, gasPrice: '30000000' }).on('receipt', (receipt) => {
  //   console.log(receipt, 'receipt');
  //   console.log(receipt.returnValues, 'returnValues:');
  //   console.log(receipt.raw, 'raw:');
  // })
  // .on('confirmation', (confirmationNumber, receipt) => {
  //   console.log(confirmationNumber, 'confirmationNumber');
  //   console.log(receipt, 'receipt con');
  // }).on('error', (error, receipt) => {
  //   console.log(error, 'error');
  // });


  // console.log(todoListApi.events, 'todoListApi.events');


  const receipt = await todoListApi.methods.createTask(`content${contentNum}`, `author${authorNum}`).send({ from: account, gas: 6721975, gasPrice: '30000000' });
  console.log(receipt, 'receipt');
  let from = receipt.from;
  let to = receipt.to;
  let transactionHash = receipt.transactionHash;
  let eventData = receipt.events.TaskCreated.returnValues;
  let content = eventData.content;
  let author = eventData.author;
  let isDone = eventData.done;

  let data = {
    from,
    to,
    transactionHash,
    content,
    author,
    isDone
  }

  // console.log(data);
  return data


  /*
      
      @desc  defult take latest block
      
  */
  // const allEvent = await todoListApi.getPastEvents('TaskCreated', { fromBlock: 0 });
  // console.log(allEvent.length, 'allEvent');

  /*
   filter data 
  */

  // const search = await todoListApi.getPastEvents('TaskCreated',
  //   {
  //     filter: {
  //       author: ['author1']
  //     },
  //     fromBlock: 0,
  //     // toBlock: 'latest'
  //   }
  // );
  // console.log(search, 'search');

  /**
   * 
   * realtime tracking event
   */

  // todoListApi.events.TaskCreated()
  //   .on('data', function (event) {
  //     console.log(event); // same results as the optional callback above
  //   });

  // await new Promise(resolve => setTimeout(() => {
  //   resolve()
  // }, 5000))

  // await todoListApi.methods.createTask(`content${contentNum}`, `author${authorNum}`).send({ from: account, gas: 6721975, gasPrice: '30000000' });

}


const downloadFile = (res) => {
  res.download(path.join(__dirname, 'pdf/contract.pdf'))
}
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
