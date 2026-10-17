// módulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//módulos internos
const fs = require('fs')

operation()

async function operation() {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Menu',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ])

    const action = answer.action

    console.log('Você escolheu:', action)
    if(action === 'Criar conta'){
        createAccount()
    }
    else if(action === 'Consultar saldo'){
        getAccountBalance()
    }
    else if(action === 'Depositar'){
        deposit()
    }
    else if(action === 'Sacar'){
        withdraw()
    }
    else if(action === 'Sair'){
        console.log(chalk.bgBlue("Voce saiu! Volte sempre!"))
        process.exit()
    }
    
    
}



function createAccount(){
    console.log(chalk.bgGreen.black('Parabéns por escolher o Banco Master'))
    console.log(chalk.green('Defina as opçoes da sua conta a seguir:'))
    buildAccount()
}

async function buildAccount(){

    const answer = await inquirer.prompt([{

        name: 'accountName',
        message: 'Digite o nome da sua conta: '

    }]).then((answer => {
        const accountName = answer['accountName']

        

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black("Essa conta já existe, escolha outro nome!"))
            buildAccount()
            return
        }

    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err){
        console.log(err)
    })
        
    console.log(chalk.bgGreen(`Parabéns ${accountName}, conta criada!`))
    operation()
    }))
    .catch((err) => console.log(err))

}
    
async function deposit(){
    const answer = await inquirer.prompt([{

        name: "accountName",
        message: "Qual o nome da sua conta?"

    }])
    .then((answer) => {

        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([{

            name: "amount",
            message: "Qual valor deseja depositar?",

        }]).then((answer) => {

            const amount = answer['amount']
             addAmount(accountName,amount)
            operation()

        }).catch(err => console.log(err))
        
    })
    .catch(err => console.log(err))
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed("Conta nao existe, tente novamente!"))
        return false
    }
    else{
        return true 
    }

}

function addAmount(accountName, amount){

    const accountData = getAccount(accountName)
    

    if(!amount){
        console.log(chalk.bgRed("Ocorreu um erro, tente novamente!"))
        return deposit()
        
    }

    accountData.balance = parseFloat(amount) +  parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData),
    function (err){
        console.log(err)
    },
   )

   console.log(chalk.bgGreen(`Foi adicionado um valor de + R$${amount} a sua conta!`))
   console.log(chalk.bgGreen(`Total:R$${accountData.balance}`))

   
}

function getAccount(accountName){

    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: "utf8",
        flag: "r"
    })

    return JSON.parse(accountJSON)


}

async function getAccountBalance(){
    const answer = await inquirer.prompt([{

        name: "accountName",
        message: "Qual o nome da sua conta?"

    }]).then((answer) => {

        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue(`O saldo da sua conta é R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}

async function withdraw(){

    const answer = await inquirer.prompt([{

        name: "accountName",
        message: "Qual o nome da sua conta?"



    }]).then((answer) => {

        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([{

            name: "amount",
            message:"Quanto voce quer sacar?"

        }]).then((answer) => {

            const amount = answer['amount']
            removeAmount(accountName, amount)
            

        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
}

function removeAmount(accountName, amount){

    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed("Ocorreu um erro, tente novamente!"))
        return withdraw()
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed("Dinheiro Insuficiente ;-;"))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err)
        },
    )

    console.log(chalk.bgBlue(`O valor de R$${amount} foi sacado!`))
    console.log(chalk.bgGreen(`Total:R$${accountData.balance}`))

    operation()
}