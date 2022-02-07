import "./index.scss";

const ethers = require('ethers');
require('dotenv').config();

//select default option for network by getting value of 1st selected text of network

// Usage example:

async function query_block_transaction(provider,block_number){
  console.log(provider,parseInt(block_number).toString(16))
  blockWithTx = await provider.getBlockWithTransactions("0x"+parseInt(block_number).toString(16))
  //for (let i=0;i<blockWithTx.transactions;i++)

  console.log(blockWithTx)

  const x = new XMLHttpRequest();
  document.body.innerHTML = `<div>
  <h3> Block Transactions </h3>
  <table id="transaction_table"> 
      <tr>
      <th>Txn Hash</th>
      <th>Method</th>
      <th>Block</th>
      <th>Age</th>
      <th>From</th>
      <th>To</th>
      <th>Value</th>
      <th>Txn Fee</th>
      </tr>
  </table>
</div>`

let table = document.getElementById("transaction_table");

for (let i=0;i<blockWithTx.transactions.length;i++){
  let row = table.insertRow(i+1)
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);
  let cell5 = row.insertCell(4);
  let cell6 = row.insertCell(5);
  let cell7 = row.insertCell(6);
  let cell8 = row.insertCell(7);

  // Add some text to the new cells:
  cell1.innerHTML = blockWithTx.transactions[i].hash;
  cell2.innerHTML = ''
  cell3.innerHTML = blockWithTx.transactions[i].blockNumber;
  cell4.innerHTML = (new Date(blockWithTx.timestamp*1000).toUTCString());
  cell5.innerHTML = blockWithTx.transactions[i].from;
  cell6.innerHTML = blockWithTx.transactions[i].to;
  cell7.innerHTML = ethers.utils.formatUnits(blockWithTx.transactions[i].value,"16")+ " Ether"
  cell8.innerHTML = ethers.utils.formatUnits((await provider.getTransactionReceipt(blockWithTx.transactions[i].hash)).gasUsed,9)
} 
}

async function query_block(provider,showsize){
  
  let blockHeight = await provider.getBlockNumber()
  let table = document.getElementById("blocks_table");

  //clear existing table
  let tablelength = table.rows.length
  //console.log(tablelength)
  for (let i=tablelength-1;i>0;i--)
    table.deleteRow(i)

  let blocks = []

  //console.log("blocks length",blocks.length)

  for (let i=blockHeight;i>blockHeight-showsize;i--){
    let block = await provider.getBlock(i)
    
    //console.log(block)

    if (block)
      blocks.push(block)
  }  
    
  for (let i=0;i<blocks.length;i++){
    let row = table.insertRow(i+1)
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);
    let cell7 = row.insertCell(6);
    let cell8 = row.insertCell(7);
    let cell9 = row.insertCell(8);
    let cell10 = row.insertCell(9);

    // Add some text to the new cells:
    cell1.innerHTML = `<a href="/block/${blocks[i].number}" id="block_link")">${blocks[i].number}</a>`;
    cell2.innerHTML = (new Date(blocks[i].timestamp*1000).toUTCString())
    cell3.innerHTML = blocks[i].transactions.length;
    cell4.innerHTML = "";
    cell5.innerHTML = blocks[i].miner;
    cell6.innerHTML = (blocks[i].gasUsed).toString();
    cell7.innerHTML = (blocks[i].gasLimit).toString();
    console.log("Base fee",blocks[i].baseFeePerGas.toString())
    cell8.innerHTML = parseFloat(ethers.utils.formatUnits(blocks[i].baseFeePerGas,"gwei")).toFixed(2)+" gwei"
    cell9.innerHTML = ethers.utils.formatUnits(blocks[i].baseFeePerGas,"gwei")*ethers.utils.formatUnits(blocks[i].gasUsed,"gwei")
  } 
  }

let selectNetwork = document.getElementById("network").options[document.getElementById("network").selectedIndex].text;
let url = ""

if (selectNetwork === "Ethereum Mainnet")
  url = process.env.MAINNET_URL
else if (selectNetwork === "Rinkeby Testnet")
  url = process.env.RINKEBY_URL

let provider = new ethers.providers.JsonRpcProvider(url);

//let provider = ethers.getDefaultProvider("rinkeby")
console.log("Loading page")

window.addEventListener("load", function() {
  console.log("Inside load listener")
  
  // if loaded href has address in it, process address action
  if (window.location.pathname.includes('/address/'))
  {
    address = window.location.pathname.split('/address/')[1]
    if(address === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    provider.getBalance(address).then((balance) => {const balanceInEth = ethers.utils.formatEther(balance)
      console.log(address,balanceInEth)
      document.getElementById("exchange-address").value = address;
      document.getElementById("balance").innerHTML = balanceInEth;
      })
      query_block(provider,10)
  }
  
  // if loaded href has block in it, process block action
  else if (window.location.pathname.includes('/block/')){
    blockNumber = window.location.pathname.split('/block/')[1]

    if(blockNumber === "") {
      return;
    }
    query_block_transaction(provider,blockNumber);    
  }
  else{
    query_block(provider,10)
  }
    
})

document.getElementById("network").addEventListener('change', (e) => {

  //Make address and balance reset
  document.getElementById("balance").innerHTML = 0;
  document.getElementById("exchange-address").value = "";
  selectNetwork = e.target.options[e.target.selectedIndex].text
  console.log(selectNetwork)
  if (selectNetwork === "Ethereum Mainnet")
    url = process.env.MAINNET_URL
  else if (selectNetwork === "Rinkeby Testnet")
    url = process.env.RINKEBY_URL

  provider = new ethers.providers.JsonRpcProvider(url);

  // call query_block() to search for top 25 blocks
  query_block(provider,10)

}, false);

document.getElementById("search").addEventListener('click', () => {
  const address = document.getElementById("exchange-address").value
  window.location.href = `/address/${address}`
});