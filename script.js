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
                ${receipt.date}  ||  ${USDollar.format(receipt.amount)} <br>
                ${receipt.account ? `<strong>Account: </strong> ${receipt.account} <br>` : ''}
                ${receipt.notes ? `<strong>Notes:</strong> ${receipt.notes} <br>` : ''}
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
                    
                    const sum = document.getElementById(receipt.account +"-sum");
                    const ul = document.getElementById(receipt.account);
                    let htmlTotal = sum.innerHTML;
                    total= Number(htmlTotal.substring(1,total.length));
                    
                    total= total + Number(receipt.amount);
                    sum.innerHTML = `${USDollar.format(total)}`;
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
        ali.innerHTML = `${receipt.date}  ||  ${USDollar.format(receipt.amount)}`
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
        receipts.splice(index, 1);
        localStorage.setItem('receipts', JSON.stringify(receipts));
        removeAccount(account)
        
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
        
        if(account && account2 && !isNaN(amount) && account!=account2 && accounts.includes(account)){
            const negAmount = Number((0-Number(amount)))
            const note1 = "Transfer to " + account2 +" //" + notes;
            const note2 = "Transfer from " + account +" //" + notes;
            let receipt = {
                date,
                account,
                amount:negAmount,
                notes:note1
            }
            savereceipt(receipt)
            loadreceipts();
            receipt = {
                date,
                account:account2,
                amount,
                notes:note2
            }
            savereceipt(receipt)
            loadreceipts();
            
        }

        
        
        receiptForm.reset();
        dateInput.value = formattedDate;
    });
    

    // Handle delete button clicks
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            const index = e.target.getAttribute('data-index');
            const account = e.target.getAttribute('data-account')
            deletereceipt(index, account);
        }
    });
    document.body.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('delete')) {
            const index = e.target.getAttribute('data-index');
            const account = e.target.getAttribute('data-account')
            deletereceipt(index, account);
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