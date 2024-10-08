document.addEventListener('DOMContentLoaded', () => {
    const receiptForm = document.getElementById('receiptForm');
    const transferForm = document.getElementById("transferForm")
    const allReceipts = document.getElementById(`all-receipts`)
    const allReceiptsSum = document.getElementById(`allReceiptsSum`)
    const bodyDiv = document.getElementById("body-div")
    const options = document.querySelectorAll(".options")
    let USDollar = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
    });
    let myColor="#baffe8";
    if(localStorage.getItem("color")) myColor = localStorage.getItem("color");
    
    var sheet = document.createElement('style')
    document.getElementById("take-color").addEventListener("input", function(){
        myColor = document.getElementById("take-color").value;
        sheet.innerHTML = `.dynamic-color {background-color: ${myColor};}`;
        console.log(myColor);
        localStorage.setItem("color", myColor)
    })
    sheet.innerHTML = `.dynamic-color {background-color: ${myColor};}`;
    document.body.appendChild(sheet);

    // Load Date
    const dateInput = document.getElementById('date');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById("date-display").innerHTML = formattedDate;

    dateInput.value = formattedDate;

    let accounts = [];
    // Load receipts from localStorage
    function loadreceipts() {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        // Clear lists
        
        allReceipts.innerHTML ='';
        if(accounts != []){
            for(let i = 0;i<receipts.length;i++){
                const aul = document.getElementById(receipts[i].account);
                const asum = document.getAnimations(receipts[i].account + "sum")
                if(aul)aul.innerHTML = "";
                if(asum)asum.innerHTML="";
                
            }
        }
        accounts = [];
        const lists = document.querySelectorAll(".list");
        for(let i = 0; i<lists.length;i++){
            lists[i].remove();
        }
        allReceiptsSum.innerHTML = '';
        let alltotal=0;
        
        receipts.forEach((receipt, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${receipt.date}  ||  ${USDollar.format(receipt.amount)} 
                ${receipt.account ? `<p class="desc">Account:  <span class="desc-acc">${receipt.account}<span></p>` : ''}
                ${receipt.notes ? `<p class="desc">Notes: ${receipt.notes}</p>` : ''}
                <button class="delete" data-index="${index}" data-account="${receipt.account}">X</button>
            `;
            
            allReceipts.appendChild(li);
            alltotal = alltotal + Number(receipt.amount);
            allReceiptsSum.innerHTML=`${USDollar.format(alltotal)}`
            // Has account
            let total = 0;
            if(receipt.account != "") {
                
                // new account
                if(!accounts.includes(receipt.account)){
                accounts.push(receipt.account);
                total = 0;
                
                
                const div = document.createElement('div');
                div.setAttribute("id", `${receipt.account}-div`)
                div.classList.add("container")
                div.classList.add("list")
                div.innerHTML=`<h1>${receipt.account}</h1>`;
                const sum = document.createElement("h2");
                sum.setAttribute("id", receipt.account + "-sum") 
                sum.innerHTML = `${USDollar.format(total)}`
                const ul = document.createElement('ul');
                ul.setAttribute("id", receipt.account);
                const hr = document.createElement('hr');
                bodyDiv.appendChild(div)
                div.appendChild(sum);
                
                div.appendChild(hr);
                div.appendChild(ul);
                
                total= total + Number(receipt.amount);
                sum.innerHTML = `${USDollar.format(total)}`;
                addToAccount(receipt, ul);
                }
                // old account
                else{
                    let isNeg = false;
                    const sum = document.getElementById(receipt.account +"-sum");
                    const ul = document.getElementById(receipt.account);
                    let htmlTotal = sum.innerHTML;
                    total= Number(htmlTotal.substring(1,htmlTotal.length));
                    if(isNaN(total)){
                        total = Number(htmlTotal.substring(2,htmlTotal.length));
                        isNeg = true;
                    }
                    if (isNeg) total = 0-total;
                    total= total + Number(receipt.amount);
                    
                    console.log("total: " + total)
                    sum.innerHTML = `${USDollar.format(total)}`;
                    console.log("setting total: " + Number(total))
                    console.log("setting total: " + USDollar.format(total))
                    addToAccount(receipt, ul);
                }
            }

            
        });
        for(let i=0; i< accounts.length; i++){
            options.innerHTML+=`<option>${accounts[i]}</option>`
        }

    }
    function addToAccount(receipt, ul) {
        
        
        const ali = document.createElement("li")
        ali.innerHTML = `${receipt.date}  ||  ${USDollar.format(receipt.amount)}<br>
        <p class="desc">${receipt.notes}</p>`
        ul.appendChild(ali);
    }

    // Save a receipt to localStorage
    function savereceipt(receipt) {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        receipts.push(receipt);
        localStorage.setItem('receipts', JSON.stringify(receipts));
    }

    // Delete a receipt from localStorage
    function deletereceipt(index, account) {
        const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
        if(receipts[index].account !="")removeAccount(account);
        receipts.splice(index, 1);
        localStorage.setItem('receipts', JSON.stringify(receipts));
        
        
        loadreceipts(); // Reload the list after deletion
    }
    function removeAccount(account) {
        const accountElement = document.getElementById(`${account}-div`) 
        accountElement.remove()
        const kill = accounts.indexOf(account)
        accounts.splice(kill, 1)
    }

    // Handle form submission
    receiptForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const account = document.getElementById('account').value;
        const account2 = document.getElementById('account2').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const notes = document.getElementById('notes').value.trim();

        if (date && !isNaN(amount) && account2 == "") {
            const receipt = {
                date,
                account,
                amount,
                notes
            };

            savereceipt(receipt);
            loadreceipts();
            
        }
        
        if(account && account2 && date && !isNaN(amount) && account!=account2 && accounts.includes(account2)){
            const negAmount = Number((0-Number(amount)))
            const note1 = "Transfer from " + account2 +" //" + notes;
            const note2 = "Transfer to " + account +" //" + notes;
            let receipt = {
                date,
                account,
                amount,
                notes:note1
            }
            savereceipt(receipt)
            loadreceipts();
            receipt = {
                date,
                account:account2,
                amount:negAmount,
                notes:note2
            }
            savereceipt(receipt)
            loadreceipts();
            
        }

        
        
        receiptForm.reset();
        dateInput.value = formattedDate;
    });
    
const warningModal=document.getElementById("warning")
// const warningReceipt=document.getElementById("warning-receipt")
const confirm=document.getElementById("confirm")
const cancel=document.getElementById("cancel")
    // Handle delete button clicks
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            const index = e.target.getAttribute('data-index');
            const account = e.target.getAttribute('data-account')
            warningModal.classList.remove("hidden");
            confirm.addEventListener("click", ()=>{
                deletereceipt(index, account);
                warningModal.classList.add("hidden");
            })
            cancel.addEventListener("click", ()=>{
                warningModal.classList.add("hidden");
            })

            
        }
    });
    document.body.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('delete')) {
            const index = e.target.getAttribute('data-index');
            const account = e.target.getAttribute('data-account')
            warningModal.classList.remove("hidden")
            confirm.addEventListener("touchend", ()=>{
                deletereceipt(index, account);
                warningModal.classList.add("hidden");
            })
            cancel.addEventListener("touchend", ()=>{
                warningModal.classList.add("hidden");
            })
        }
    });

    // Filter receipts based on search input
    // function filterreceipts(searchInput, list) {
    //     const searchTerm = searchInput.value.toLowerCase();
    //     const items = list.querySelectorAll('li');
    //     items.forEach(item => {
    //         const text = item.innerText.toLowerCase();
    //         item.style.display = text.includes(searchTerm) ? '' : 'none';
    //     });
    // }

    // // Add event listeners for search inputs
    // shortreceiptsearch.addEventListener('input', () => filterreceipts(shortreceiptsearch, shortreceiptList));
    // mediumreceiptsearch.addEventListener('input', () => filterreceipts(mediumreceiptsearch, mediumreceiptList));
    // longreceiptsearch.addEventListener('input', () => filterreceipts(longreceiptsearch, longreceiptList));

    // // Clear search input
    // function clearSearch(searchInput, list) {
    //     searchInput.value = '';
    //     filterreceipts(searchInput, list);
    // }

    // clearShortreceiptsearch.addEventListener('click', () => clearSearch(shortreceiptsearch, shortreceiptList));
    // clearMediumreceiptsearch.addEventListener('click', () => clearSearch(mediumreceiptsearch, mediumreceiptList));
    // clearLongreceiptsearch.addEventListener('click', () => clearSearch(longreceiptsearch, longreceiptList));

    loadreceipts(); // Initial load of receipts
});